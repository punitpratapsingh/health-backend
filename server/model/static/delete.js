/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import { StaticModel } from '../../schemas';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 09 October, 2019 11:50:53
*/

export default ({ staticId }) => new Promise(async (resolve, reject) => {
	try {
		if (!staticId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'There is required property missing staticId' }));
		}
		const lookUpQuery = { _id: staticId };
		await StaticModel.findByIdAndRemove(lookUpQuery);
		resolve(ResponseUtility.SUCCESS());
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Error', error: err.message }));
	}
});

