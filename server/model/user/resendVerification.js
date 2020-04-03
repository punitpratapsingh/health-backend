/* eslint-disable no-underscore-dangle */
/* eslint-disable import/named */
import {
	ResponseUtility,
	RandomCodeUtility,
	EmailServices,
} from 'appknit-backend-bundle';
import { UserModel } from '../../schemas';
import { HOST, VERIFICATION_TYPE, USER_TYPE } from '../../constants';
/**
 * @description Service model function to resend the verification code email
 * if user haven;t received it or initiates a password chan
 * @author punit
 * @since 20 august 2019
 * @param {String} email to resend the verification email to change password
 * @param {Number} requestType represent the request type @see constants to see mapping
 * 1: resend verification email.
 * 2: initiate the change password request.
 * Both the actions will be handled at front end by the web interfaces
 * the password change process will also take place via a web page.
*/
export default ({
	email,
	role = USER_TYPE.USER,
	requestType = VERIFICATION_TYPE.EMAIL_VERIFICATION,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!email) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing required property email.' }));
		}
		// check for valid request type and handle generic values.
		let updateQuery;
		const token = RandomCodeUtility(10);
		const date = new Date();
		let emailMessage;
		let emailSubject;

		const lookupQuery = { email: { $regex: `^${email}$`, $options: 'i' }, type: role };
		const account = await UserModel.findOne(lookupQuery);
		if (!account) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No account registered with this email address.' }));
		}

		switch (requestType) {
			case VERIFICATION_TYPE.EMAIL_VERIFICATION:
				updateQuery = {
					emailToken: token,
					emailTokenDate: date,
					updatedOn: date,
				};
				emailMessage = `Click the URL to verify ${HOST}user/verify?id=${account._id.toString()}&emailToken=${token}`;
				emailSubject = 'Please Verify your email';
				break;
			case VERIFICATION_TYPE.CHANGE_PASSWORD:
				updateQuery = {
					changePassToken: token,
					changePassTokenDate: date,
					updatedOn: date,
				};
				emailMessage = `Click the following link to change your password ${HOST}user/changePassword?id=${account._id.toString()}&tok=${token}`;
				emailSubject = 'Change Wellness password';
				break;
			default:
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid request type.' }));
		}

		// update the passToken in the database
		await UserModel.findOneAndUpdate(lookupQuery, updateQuery);
		// send the verification email to the user
		await EmailServices({
			to: email,
			text: emailMessage,
			subject: emailSubject,
		});
		return resolve(ResponseUtility.SUCCESS({ message: 'An email with verification link has been sent to your email id.' }));
		// write your code here.....
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while resending verification.', error: `${err}` }));
	}
});
