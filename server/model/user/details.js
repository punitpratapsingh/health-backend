import { ResponseUtility } from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
import {
	USER_TYPE,
} from '../../constants';

/**
 * @description to get details of user.
 * @author punit
 * @since 20 August, 2019
 * @param {String} id the unique id of the user who is requesting to see profile details.
 */
export default ({
	id,
	type,
}) => new Promise(async (resolve, reject) => {
	try {
		let role = USER_TYPE.USER;
		if (type === 'admin') {
			role = USER_TYPE.STAFF;
		}
		const lookupQuery = { _id: id, deleted: { $ne: true }, type: role };
		const projection = {
			registeredOn: 0,
			updatedOn: 0,
			password: 0,
			blocked: 0,
			deleted: 0,
			emailToken: 0,
			__v: 0,
			device: 0,
			fcmToken: 0,
			changePassToken: 0,
			changePassTokenDate: 0,
		};

		const user = await UserModel.findOne(lookupQuery, projection);
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user Found.' }));
		}
		return resolve(ResponseUtility.SUCCESS({
			data: Object.assign(
				{
					...user._doc,
				},
			),
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while getting user details.', error: `${err}` }));
	}
});
