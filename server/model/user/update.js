import {
	ResponseUtility,
	SchemaMapperUtility,
	RandomCodeUtility,
} from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
import { AMQP_QUEUES } from '../../constants';

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
	id,
	userId,
	firstName,
	lastName,
	phoneCode,
	phoneNumber,
	speciality,
	experience,
	address,
	country,
	accessLevel,
	type,
	description,
	certification,
	image,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (type === 'admin') {
			id = userId;
		} else if (accessLevel) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Only admin can change access level.' }));
		}
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user found.' }));
		}
		let picture;
		if (image) {
			if (user.picture) {
				AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: user.picture,
					})),
				);
			}
			picture = `${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: picture,
					image,
				})),
			);
		}
		const updateQuery = await SchemaMapperUtility({
			firstName,
			lastName,
			phoneCode,
			phoneNumber,
			picture,
			speciality,
			experience,
			accessLevel,
			description,
			certification,
			address,
			country,
			updatedOn: new Date(),
		});
		await UserModel.findByIdAndUpdate(
			{ _id: id },
			updateQuery,
			{ new: true },
		);
		return resolve(ResponseUtility.SUCCESS({ message: 'Your profile has been updated.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while updating user', error: `${err}` }));
	}
});
