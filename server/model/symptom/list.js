import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import SymptomModel from '../../schemas/symptom';

/**
 * @description service model function to handle the listing
 * of symptoms
 * @author punit
 * @since 3 Sep 2019
 * @param {String} symptomId the unique id of the symptom.
 * @param {String} name the name of the symptom.
 * @param {Number} page for pagination page represents page number of results shown.
 * @param {Number} limit for pagination limit represents number of results per page.
 */
export default ({
	symptomId,
	name,
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		const matchQuery = {
			$match:
			{
			},
		};
		if (symptomId) {
			matchQuery.$match._id = Types.ObjectId.createFromHexString(symptomId);
		}
		name ? (matchQuery.$match.name = { $regex: new RegExp(name), $options: 'i' }) : 0;
		const aggregationQuery = [
			matchQuery,
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		];
		const data = await SymptomModel.aggregate(aggregationQuery);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, page, limit }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing symptoms.', error: `${err}` }));
	}
});
