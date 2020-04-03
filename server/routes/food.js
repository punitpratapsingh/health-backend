import {
	FoodControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/food/';
/**
 * @description
 * This is the route handler for the foods
 * @author punit
 * @since 2 Sep, 2019
 */
export default (app) => {
	app.post(`${prefix}create`, AuthenticationControllers.authenticateAdmin, FoodControllers.create);
	app.post(`${prefix}update`, AuthenticationControllers.authenticateAdmin, FoodControllers.update);
	app.post(`${prefix}delete`, AuthenticationControllers.authenticateAdmin, FoodControllers.delete);
	app.post(`${prefix}list`, FoodControllers.list);
};


