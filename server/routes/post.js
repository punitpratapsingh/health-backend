import { MultipartService } from '../services';
import {
	AuthenticationControllers,
	PostControllers,
} from '../controllers';

const prefix = '/api/post/';
/**
 * @description
 * This is the route handler for the post
 * @author punit
 * @since 24 Aug, 2019
 */
export default (app) => {
	app.post(`${prefix}create`, MultipartService, AuthenticationControllers.authenticateStaff,
		AuthenticationControllers.checkAccessBlogs,
		PostControllers.create);
	app.post(`${prefix}update`, MultipartService, AuthenticationControllers.authenticateStaff, PostControllers.update);
	app.post(`${prefix}list`, PostControllers.list);
	app.post(`${prefix}commentList`, PostControllers.commentList);
	app.post(`${prefix}replyList`, PostControllers.replyList);
	app.post(`${prefix}delete`, AuthenticationControllers.authenticateStaff, PostControllers.delete);
};
