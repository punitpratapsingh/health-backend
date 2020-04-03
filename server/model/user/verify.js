import { ResponseUtility } from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';

/**
 * @description This service modal is for verification of
 * of user account.
 * @author punit
 * @since 20 august 2019
 * @param {String} id the unique id of the user who is requesting to see profile details.
 * @param {String} emailToken the unique token sent to user with verification email.
 */

export default ({
	id,
	emailToken,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(id && emailToken)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing either of the required properties.' }));
		}

		const user = await UserModel.findOne({ _id: id, emailToken });

		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Access Token.' }));
		}
		if (user.isVerified) {
			return resolve('<h1 style="text-align: center">Your account is already verified.</h1>');
			// return reject(ResponseUtility.GENERIC_ERR({ message: 'User is already verified.' }));
		}
		const updateQuery = {
			$set: {
				isVerified: true,
			},
			$unset:
			{
				emailToken: 1,
				emailTokenDate: 1,
			},
		};
		await UserModel.updateOne({ _id: id }, updateQuery);
		return resolve('<h1 style="text-align: center">Your account has been verified. You can now use Wellness app.</h1>');
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error in email verification.', error: `${err}` }));
	}
});
