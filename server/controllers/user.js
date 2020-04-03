/**
 * @description controllers for users
 * @author punit
 * @since 24 August 2019
*/
import { UserModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	create: (req, res) => ModelResolver(req, res, UserModel.UsersCreateService),
	verify: (req, res) => {
		const { query: { id, emailToken } } = req;
		UserModel.UsersVerifyService({ id, emailToken })
			.then(sucess => res.send(sucess))
			.catch(err => res.send(err));
	},
	checkEmail: (req, res) => ModelResolver(req, res, UserModel.UsersCheckEmailService),
	changePassword: (req, res) => ModelResolver(req, res, UserModel.UsersChangePasswordService),
	resendVerification: (req, res) => ModelResolver(req, res, UserModel.UsersResendVerificationService),
	password: (req, res) => {
		const { query: { id, tok } } = req;
		UserModel.UsersPasswordService({ id, tok })
			.then((sucess) => {
				res.set('Content-Type', 'text/html');
				res.send(sucess.data);
			})
			.catch(err => res.send(err));
	},
	details: (req, res) => ModelResolver(req, res, UserModel.UsersDetailsService),
	update: (req, res) => ModelResolver(req, res, UserModel.UsersUpdateService),
	listUsers: (req, res) => ModelResolver(req, res, UserModel.UsersListService),
	listConversation: (req, res) => ModelResolver(req, res, UserModel.UsersListConversationService),
	listNotificaion: (req, res) => ModelResolver(req, res, UserModel.UsersListNotificationService),
	listChatUsers: (req, res) => ModelResolver(req, res, UserModel.UsersListChatUsersService),
	contactUs: (req, res) => ModelResolver(req, res, UserModel.UsersContactUsService),
};
