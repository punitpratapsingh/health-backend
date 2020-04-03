import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import FoodModel from '../../schemas/food';

/**
 * @description service model function to handle the listing
 * of foods
 * @author gurlal
 * @since 2 Sep 2019
 * @param {String} foodId the unique id of food.
 * @param {String} name the name of the food.
 * @param {Number} page for pagination page represents page number of results shown.
 * @param {Number} limit for pagination limit represents number of results per page.
 */
export default ({
	foodId,
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
		if (foodId) {
			matchQuery.$match._id = Types.ObjectId.createFromHexString(foodId);
		}
		name ? (matchQuery.$match.name = { $regex: new RegExp(`${name}`), $options: 'i' }) : 0;
		const aggregationQuery = [
			matchQuery,
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		];
		const data = await FoodModel.aggregate(aggregationQuery);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, page, limit }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing Foods.', error: `${err}` }));
	}
});
