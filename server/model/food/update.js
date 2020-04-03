import {
	ResponseUtility,
	SchemaMapperUtility,
} from 'appknit-backend-bundle';
import FoodModel from '../../schemas/food';
import { LECTIN_METER } from '../../constants';

/**
 * @description service model function to handle the updation
 * of foods
 * @author gurlal
 * @since 2 Sep 2019
 * @param {String} foodId the unique id of food.
 * @param {String} name the name of the food.
 * @param {Number} level the level of lectin meter in food.
 * @param {String} description the description of food.
 * @param {String} lectionary the description of lectionary.
 * @param {String} recommendation the basic reccomendation.
 */
export default ({
	foodId,
	name,
	level,
	description,
	lectionary,
	recommendation,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!foodId
		|| !(name || level || description)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const food = await FoodModel.findOne({ _id: foodId });
		if (!food) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No food found.' }));
		}
		if (level < LECTIN_METER.LOW || level > LECTIN_METER.HIGH) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid input data.' }));
		}
		const updateQuery = await SchemaMapperUtility({
			name,
			level,
			description,
			lectionary,
			recommendation,
			updatedOn: new Date(),
		});
		await FoodModel.updateOne({ _id: foodId }, updateQuery);
		return resolve(ResponseUtility.SUCCESS({ message: 'Food is updated.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while updating Food.', error: `${err}` }));
	}
});
