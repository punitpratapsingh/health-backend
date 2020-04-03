import {
	ResponseUtility,
	RandomCodeUtility,
	HashUtility,
	EmailServices,
	TokenUtility,
} from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
import ChannelModel from '../../schemas/channel';
import {
	HOST,
	AMQP_QUEUES,
	USER_TYPE,
} from '../../constants';

/**
 * @description service model function to handle the creation
 * This is a common function that could be used to create as
 * well as update the existing user.
 * of the new user. This will handle the profile completion process
 * @author punit
 * @since 20 august 2019
 *
 */
export default ({
	firstName,
	lastName,
	email,
	phoneCode,
	phoneNumber,
	speciality,
	experience,
	description,
	certification,
	address,
	country,
	AMQPChannel,
	accessLevel,
	// day,
	// month,
	// year,
	// gender,
	password,
	image,
	type,
	login,
	device,
	fcmToken,
	staffLogin,
}) => new Promise(async (resolve, reject) => {
	console.log(password);
	try {
		let role = USER_TYPE.USER;
		let userRole = 'user';
		if (type === 'admin' || staffLogin) {
			role = USER_TYPE.STAFF;
			userRole = 'admin';
		}
		if (login && !(email && password)) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing either of the required properties for login.' }));
		}
		const checkUnique = await UserModel.findOne({ email: { $regex: `^${email}$`, $options: 'i' }, type: role });
		if (login) {
			if (checkUnique && !checkUnique.deleted) {
				const passwordMatch = await HashUtility.compare({
					text: password,
					hash: checkUnique.password,
				});
				if (!checkUnique.isVerified) {
					return reject(ResponseUtility.GENERIC_ERR({ message: 'Please verify your email id to login' }));
				}
				if (checkUnique.blocked) {
					return reject(ResponseUtility.GENERIC_ERR({ message: 'Your account has been blocked by admin' }));
				}
				if (checkUnique.deleted) {
					return reject(ResponseUtility.GENERIC_ERR({ message: 'This email has already been used' }));
				}
				if (passwordMatch) {
					// update the fcmToken and device
					const token = await TokenUtility.generateToken({
						id: checkUnique._id,
						email,
						role: userRole,
						tokenLife: '30d',
					});
					const updateQuery = { fcmToken, device };
					await UserModel.findOneAndUpdate({ _id: checkUnique._id }, updateQuery);
					return resolve(ResponseUtility.SUCCESS({
						data: {
							accessToken: token,
							user: {
								...checkUnique._doc,
								isVerified: undefined,
								blocked: undefined,
								deleted: undefined,
								password: undefined,
								emailToken: undefined,
								emailTokenDate: undefined,
								updatedOn: undefined,
								createdOn: undefined,
								device: undefined,
								fcmToken: undefined,
								changePassToken: undefined,
								changePassTokenDate: undefined,
							},
						},
					}));
				}
				return reject(ResponseUtility.LOGIN_AUTH_FAILED());
			}
			return reject(ResponseUtility.NO_USER());
		}
		if (checkUnique) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'This email has already been used' }));
		}

		let picture;
		if (image) {
			picture = `${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: picture,
					image,
				})),
			);
		}

		let userDetails;
		let userObject;
		if (role === USER_TYPE.STAFF) {
			userObject = new UserModel({
				firstName,
				lastName,
				email,
				type: role,
				phoneCode,
				phoneNumber,
				picture,
				password: await HashUtility.generate({ text: password }),
				speciality,
				experience,
				accessLevel,
				description,
				certification,
				address,
				country,
				isVerified: true,
				createdOn: new Date(),
				updatedOn: new Date(),
			});
		}
		if (role === USER_TYPE.USER) {
			const emailToken = RandomCodeUtility(10);
			userObject = new UserModel({
				firstName,
				lastName,
				email,
				type: role,
				phoneCode,
				phoneNumber,
				picture,
				password: await HashUtility.generate({ text: password }),
				emailToken,
				fcmToken,
				device,
				address,
				country,
				emailTokenDate: new Date(),
				createdOn: new Date(),
				updatedOn: new Date(),
			});
			const ChannelObject = new ChannelModel({
				userRef: userObject._id,
				createdOn: new Date(),
				updatedOn: new Date(),
			});
			await ChannelObject.save();
			// sending email to verify
			await EmailServices({ to: email, text: `Click the URL to verify ${HOST}user/verify?id=${userObject._id.toString()}&emailToken=${emailToken}`, subject: 'Please verify your email' });
		}
		const userDetail = await userObject.save();
		// save user object and genration of token
		const { _id } = userDetail;
		const lookupQuery = { _id };
		userDetails = await UserModel.findOne(lookupQuery);
		const token = await TokenUtility.generateToken({
			id: userDetail._id, email, role: userRole, tokenLife: '30d',
		});
		return resolve(ResponseUtility.SUCCESS({
			data: {
				accessToken: token,
				user: {
					...userDetails._doc,
					isVerified: undefined,
					blocked: undefined,
					deleted: undefined,
					password: undefined,
					emailToken: undefined,
					emailTokenDate: undefined,
					updatedOn: undefined,
					createdOn: undefined,
					device: undefined,
					fcmToken: undefined,
					changePassToken: undefined,
					changePassTokenDate: undefined,
				},
			},
		}));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while creating user.', error: `${err}` }));
	}
});
