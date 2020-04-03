/* eslint-disable import/named */
import { ResponseUtility, HashUtility } from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
/**
 * @description A service model function to handle the view part
 * of the password screen.This will contain a token field and a
 * new password screen and then allow to send request to change the
 * password along with the password token and new password.
 * @author punit
 * @since 20 august 2019
*/
export default ({
	user_name,
	passToken,
	password,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(user_name && passToken)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing either of the required properties.' }));
		}

		const user = await UserModel.findOne({ _id: user_name, changePassToken: passToken });

		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Access Token.' }));
		}


		const updateQuery = {
			$set: {
				password: await HashUtility.generate({ text: password }),

			},
			$unset:
			{
				changePassToken: 1,
				changePassTokenDate: 1,
			},
		};
		await UserModel.updateOne({ _id: user_name }, updateQuery);
		return resolve('<h1 style="text-align: center">Your Wellness Account password has been updated successfully.</h1>');
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Error', error: err.message }));
	}
});
