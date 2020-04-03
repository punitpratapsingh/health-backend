import { ResponseUtility } from 'appknit-backend-bundle';
import  UserModel  from '../../schemas/user';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 03 October, 2019 17:00:33
*/

export default ({
	usersId,
	blocked,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!usersId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'There is id required userId is missing' }));
		}
		const lookUpQuery = { _id: usersId, blocked: !blocked };
		const updateQuery = { blocked };
		await UserModel.findByIdAndUpdate(lookUpQuery, updateQuery);
		resolve(ResponseUtility.SUCCESS());
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Error', error: err.message }));
	}
});

