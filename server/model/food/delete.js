import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import FoodModel from '../../schemas/food';

/**
 * @description service model function to handle the deletion
 * of foods
 * @author gurlal
 * @since 2 Sep 2019
 * @param {String} foodId the unique id of food.
 */
export default ({
	foodId,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!foodId) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const food = await FoodModel.findOneAndDelete({ _id: foodId });
		if (!food) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No food found.' }));
		}
		return resolve(ResponseUtility.SUCCESS({ message: 'Food is deleted.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while deleting Food.', error: `${err}` }));
	}
});
