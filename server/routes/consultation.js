import {
	AuthenticationControllers,
	UserControllers,
    PostControllers,
    ConsultationControllers,
} from '../controllers';

const prefix = '/api/consultation/';
/**
 * @description
 * This is the route handler for the consultations
 * @author punit
 * @since 26 Aug, 2019
 */
export default (app) => {
	app.post(`${prefix}createTimeslot`, AuthenticationControllers.authenticateAdmin, ConsultationControllers.createTimeslot);
	app.post(`${prefix}deleteTimeslot`, AuthenticationControllers.authenticateAdmin, ConsultationControllers.deleteTimeslot);
	app.post(`${prefix}updateTimeslot`, AuthenticationControllers.authenticateAdmin, ConsultationControllers.updateTimeslot);
	app.post(`${prefix}listTimeslot`, AuthenticationControllers.authenticateUser, ConsultationControllers.listTimeslot);
	app.post(`${prefix}cancelTimeslot`, AuthenticationControllers.authenticateAdmin, ConsultationControllers.cancelSlot);
	app.post(`${prefix}requestConsultation`, AuthenticationControllers.authenticateUser, ConsultationControllers.requestConsultation);
	app.post(`${prefix}listRequest`, AuthenticationControllers.authenticateAdmin, ConsultationControllers.listRequest);
	app.post(`${prefix}requestAction`, AuthenticationControllers.authenticateAdmin, ConsultationControllers.requestAction);
};
