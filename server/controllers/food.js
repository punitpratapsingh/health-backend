/**
 * @description controllers for food
 * @author punit
 * @since 2 Sep 2019
 */
import {
	FoodModel,
} from '../model';
import { ModelResolver } from './resolvers';

export default {
	create: (req, res) => ModelResolver(req, res, FoodModel.FoodsCreateService),
	update: (req, res) => ModelResolver(req, res, FoodModel.FoodsUpdateService),
	delete: (req, res) => ModelResolver(req, res, FoodModel.FoodsDeleteService),
	list: (req, res) => ModelResolver(req, res, FoodModel.FoodsListService),
};
