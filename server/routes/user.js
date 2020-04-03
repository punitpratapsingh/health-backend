import { MultipartService } from '../services';
import {
	AuthenticationControllers,
	AdminControllers,
	UserControllers,
	ConsultationControllers,
	PostControllers,
} from '../controllers';

const prefix = '/api/user/';
/**
 * @description
 * This is the route handler for the users
 * @author punit
 * @since 19 Aug, 2019
 */
export default (app) => {
	app.post(`${prefix}create`, MultipartService, UserControllers.create);
	app.post(`${prefix}update`, MultipartService, AuthenticationControllers.authenticateUser, UserControllers.update);
	app.get(`${prefix}verify`, UserControllers.verify);
	app.post(`${prefix}checkEmail`, UserControllers.checkEmail);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateUser, UserControllers.details);
	app.post(`${prefix}changePassword`, UserControllers.changePassword);
	app.get(`${prefix}changePassword`, UserControllers.password);
	app.post(`${prefix}resendVerification`, UserControllers.resendVerification);
	app.post(`${prefix}comment`, AuthenticationControllers.authenticateUser, PostControllers.comment);
	app.post(`${prefix}reply`, AuthenticationControllers.authenticateUser, PostControllers.reply);
	app.post(`${prefix}listUsers`, AuthenticationControllers.authenticateUser, UserControllers.listUsers);
	app.post(`${prefix}contactUs`, UserControllers.contactUs);
	app.post(`${prefix}listRequest`, AuthenticationControllers.authenticateUser, ConsultationControllers.listRequest);
	app.post(`${prefix}listConversation`, AuthenticationControllers.authenticateUser, UserControllers.listConversation);
	app.post(`${prefix}listNotificaion`, AuthenticationControllers.authenticateUser, UserControllers.listNotificaion);
	app.post(`${prefix}listTimeslot`, AuthenticationControllers.authenticateUser, ConsultationControllers.listTimeslot);
	app.post(`${prefix}staticData`, AdminControllers.listStatic);
};
