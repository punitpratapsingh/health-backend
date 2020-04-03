import {
	SymptomControllers,
	AuthenticationControllers,
} from '../controllers';
import { MultipartService } from '../services';

const prefix = '/api/symptom/';
/**
 * @description
 * This is the route handler for the symptoms
 * @author punit
 * @since 3 Sep, 2019
 */
export default (app) => {
	app.post(`${prefix}create`, MultipartService, AuthenticationControllers.authenticateAdmin, SymptomControllers.create);
	app.post(`${prefix}update`, MultipartService, AuthenticationControllers.authenticateAdmin, SymptomControllers.update);
	app.post(`${prefix}delete`, AuthenticationControllers.authenticateAdmin, SymptomControllers.delete);
	app.post(`${prefix}list`, SymptomControllers.list);
};
