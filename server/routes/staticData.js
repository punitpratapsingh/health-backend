import {
	StaticDataControllers,
} from '../controllers';

const prefix = '/api/staticData/';
/**
 * @description This route file is responsible for staticData
 * @author punit
 * @since 27 august 2019
 */

export default (app) => {
	app.get(`${prefix}fetch`, StaticDataControllers.fetch);
};
