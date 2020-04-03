import { MultipartService } from '../services';
import {
	AuthenticationControllers,
	AdminControllers,
	ConsultationControllers,
} from '../controllers';

const prefix = '/api/admin/';
/**
 * @description
 * This is the route handler for the admin
 * @author punit
 * @since 24 Aug, 2019
 */
export default (app) => {
	app.post(`${prefix}authenticate`, AdminControllers.authenticate);
	app.post(`${prefix}stats`, AdminControllers.stats);
	app.post(`${prefix}listUser`, AuthenticationControllers.authenticateAdmin, AdminControllers.listUser);
	app.post(`${prefix}listStaff`, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessStaff, AdminControllers.listStaff);
	app.post(`${prefix}deleteUser`, AuthenticationControllers.authenticateAdmin, AdminControllers.deleteUser);
	app.post(`${prefix}blockUser`, AuthenticationControllers.authenticateAdmin, AdminControllers.blockUser);
	app.post(`${prefix}listSymptoms`, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessGutWellness, AdminControllers.listSymptoms);
	app.post(`${prefix}addSymptoms`, MultipartService, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessGutWellness, AdminControllers.addSymptoms);
	app.post(`${prefix}deleteSymptoms`, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessGutWellness, AdminControllers.deleteSymptoms);
	app.post(`${prefix}updateSymptoms`, MultipartService, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessGutWellness, AdminControllers.updateSymptoms);
	app.post(`${prefix}listBlogs`, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessBlogs, AdminControllers.listBlogs);
	app.post(`${prefix}updateBlog`, MultipartService, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessBlogs, AdminControllers.updateBlog);
	app.post(`${prefix}deleteBlog`, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessBlogs, AdminControllers.deleteBlog);
	app.post(`${prefix}addBlogs`, MultipartService, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessBlogs, AdminControllers.addBlogs);
	app.post(`${prefix}addStaff`, MultipartService, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessStaff, AdminControllers.addStaff);
	app.post(`${prefix}listAppointment`, AuthenticationControllers.authenticateAdmin, AdminControllers.listAppointment);
	app.post(`${prefix}actionAppointment`, AuthenticationControllers.authenticateAdmin, AdminControllers.actionAppointment);
	app.post(`${prefix}listSlot`, AuthenticationControllers.authenticateAdmin, AdminControllers.listSlot);
	app.post(`${prefix}addSlot`, AuthenticationControllers.authenticateAdmin, AdminControllers.addSlot);
	app.post(`${prefix}deleteSlot`, AuthenticationControllers.authenticateAdmin, AdminControllers.deleteSlot);
	app.post(`${prefix}createStatic`, AuthenticationControllers.authenticateAdmin, AdminControllers.createStatic);
	app.post(`${prefix}listStatic`, AuthenticationControllers.authenticateAdmin, AdminControllers.listStatic);
	app.post(`${prefix}deleteStatic`, AuthenticationControllers.authenticateAdmin, AdminControllers.deleteStatic);
	app.post(`${prefix}updateStatic`, AuthenticationControllers.authenticateAdmin, AdminControllers.updateStatic);
	app.post(`${prefix}listFood`, AuthenticationControllers.authenticateAdmin, AdminControllers.listFood);
	app.post(`${prefix}createFood`, AuthenticationControllers.authenticateAdmin, AdminControllers.createFood);
	app.post(`${prefix}deleteFood`, AuthenticationControllers.authenticateAdmin, AdminControllers.deleteFood);
	app.post(`${prefix}updateFood`, AuthenticationControllers.authenticateAdmin, AdminControllers.updateFood);
	app.post(`${prefix}commentList`, AuthenticationControllers.authenticateAdmin, AdminControllers.commentList);
	app.post(`${prefix}commentReply`, AdminControllers.commentReply);
	app.post(`${prefix}commentCreate`, AdminControllers.commentCreate);

	// listing the admin conversations checkAccessChat
	app.post(`${prefix}listAdminConversation`, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessChat, AdminControllers.listAdminConversations);
	// // gurlal
	app.post(`${prefix}createStaff`, MultipartService, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessStaff, AdminControllers.createStaff);
	app.post(`${prefix}updateStaff`, MultipartService, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessStaff, AdminControllers.updateStaff);
	app.post(`${prefix}createPost`, MultipartService, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessBlogs, AdminControllers.createPost);
	app.post(`${prefix}updatePost`, MultipartService, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessBlogs, AdminControllers.updatePost);
	app.post(`${prefix}deletePost`, AuthenticationControllers.authenticateAdmin, AuthenticationControllers.checkAccessBlogs, AdminControllers.deletePost);
	app.post(`${prefix}listTimeslot`, AuthenticationControllers.authenticateAdmin, ConsultationControllers.listTimeslot);
};
