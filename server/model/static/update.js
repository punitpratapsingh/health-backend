/* eslint-disable import/named */
import { ResponseUtility, SchemaMapperUtility } from 'appknit-backend-bundle';
import { StaticModel } from '../../schemas';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 09 October, 2019 11:50:53
*/

export default ({
	staticId,
	aboutUs,
	privacyPolicy,
	termsAndCondition,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!staticId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'There is required property missing staticId' }));
		}
		const lookUpQuery = { _id: staticId };
		const updateQuery = await SchemaMapperUtility({
			aboutUs,
			privacyPolicy,
			termsAndCondition,

		});

		await StaticModel.findByIdAndUpdate(lookUpQuery, updateQuery);
		resolve(ResponseUtility.SUCCESS());
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Error', error: err.message }));
	}
});

