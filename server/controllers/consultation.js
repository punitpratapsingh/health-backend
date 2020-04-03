/**
 * @description controllers for consultations
 * @author punit
 * @since 26 August 2019
 */
import {
	ConsultationModel,
} from '../model';
import { ModelResolver } from './resolvers';

export default {
	createTimeslot: (req, res) => ModelResolver(
		req, res, ConsultationModel.ConsultationsCreateSlotService,
	),
	deleteTimeslot: (req, res) => ModelResolver(
		req, res, ConsultationModel.ConsultationsDeleteSlotService,
	),
	updateTimeslot: (req, res) => ModelResolver(
		req, res, ConsultationModel.ConsultationsUpdateSlotService,
	),
	listTimeslot: (req, res) => ModelResolver(
		req, res, ConsultationModel.ConsultationsListSlotService,
	),
	requestConsultation: (req, res) => ModelResolver(
		req, res, ConsultationModel.ConsultationsRequestService,
	),
	listRequest: (req, res) => ModelResolver(
		req, res, ConsultationModel.ConsultationsListRequestService,
	),
	requestAction: (req, res) => ModelResolver(
		req, res, ConsultationModel.ConsultationsRequestActionService,
	),
	cancelSlot: (req, res) => ModelResolver(
		req, res, ConsultationModel.ConsultationsCancelSlotService,
	),
};
