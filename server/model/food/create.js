import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import FoodModel from '../../schemas/food';
import { LECTIN_METER } from '../../constants';

/**
 * @description service model function to handle the creation
 * of foods
 * @author gurlal
 * @since 2 Sep 2019
 * @param {String} name the name of the food.
 * @param {Number} level the level of lectin meter in food.
 * @param {String} description the description of food.
 */
export default ({
	name,
	level,
	description,
	lectionary,
	recommendation,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(name && level && description && lectionary && recommendation)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		if (level < LECTIN_METER.LOW || level > LECTIN_METER.HIGH) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid input data.' }));
		}
		const FoodObject = new FoodModel({
			name,
			level,
			description,
			lectionary,
			recommendation,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		await FoodObject.save();
		return resolve(ResponseUtility.SUCCESS({ message: 'New Food is Saved.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while saving food.', error: `${err}` }));
	}
});
