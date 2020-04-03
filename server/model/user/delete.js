/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import { UserModel } from '../../schemas';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 03 October, 2019 17:01:55
*/

export default ({ usersId }) => new Promise(async (resolve, reject) => {
	try {
		if (!usersId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'There is required property missing usersId' }));
		}
		const lookUpQuery = { _id: usersId, deleted: false };
		const updateQuery = { deleted: true };
		await UserModel.findByIdAndUpdate(lookUpQuery, updateQuery, { new: true });
		resolve(ResponseUtility.SUCCESS());
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Error', error: err.message }));
	}
});

