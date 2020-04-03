/**
 * @description controllers for symptom
 * @author punit
 * @since 3 Sep 2019
 */
import {
	SymptomModel,
} from '../model';
import { ModelResolver } from './resolvers';

export default {
	create: (req, res) => ModelResolver(req, res, SymptomModel.SymptomsCreateService),
	update: (req, res) => ModelResolver(req, res, SymptomModel.SymptomsUpdateService),
	delete: (req, res) => ModelResolver(req, res, SymptomModel.SymptomsDeleteService),
	list: (req, res) => ModelResolver(req, res, SymptomModel.SymptomsListService),
};
