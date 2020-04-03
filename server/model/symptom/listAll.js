import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import SymptomModel from '../../schemas/symptom';
/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 19 October, 2019 15:05:32
*/
export default ({
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		const matchQuery = {
			$match:
			{
			},
		};
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
