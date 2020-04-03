import { MultipartService } from '../services';
import {
	AuthenticationControllers,
	UserControllers,
	PostControllers,
} from '../controllers';
import { USER_TYPE } from '../constants';

const prefix = '/api/staff/';
/**
 * @description
 * This is the route handler for the staff
 * @author punit
 * @since 24 Aug, 2019
 */
export default (app) => {
	app.post(`${prefix}login`, (req, res, next) => {
		req.body.login = true;
		req.body.staffLogin = true;
		next();
	}, UserControllers.create);
	app.post(`${prefix}update`, MultipartService, AuthenticationControllers.authenticateStaff, UserControllers.update);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateStaff, UserControllers.details);
	app.post(`${prefix}changePassword`, UserControllers.changePassword);
	app.get(`${prefix}changePassword`, UserControllers.password);
	app.post(`${prefix}resendVerification`, (req, res, next) => {
		req.body.role = USER_TYPE.STAFF;
		next();
	}, UserControllers.resendVerification);
	app.post(`${prefix}comment`, AuthenticationControllers.authenticateStaff, PostControllers.comment);
	app.post(`${prefix}reply`, AuthenticationControllers.authenticateStaff, PostControllers.reply);
	app.post(`${prefix}listConversation`, AuthenticationControllers.authenticateUser, UserControllers.listConversation);
	app.post(`${prefix}listChatUsers`, AuthenticationControllers.authenticateStaff, AuthenticationControllers.checkAccessChat, UserControllers.listChatUsers);
};
