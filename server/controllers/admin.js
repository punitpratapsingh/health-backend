/**
 * @description controllers  for admin
 * @author punit
 * @since 24 August 2019
 */
import {
	ResponseUtility,
	TokenUtility,
} from 'appknit-backend-bundle';
import {
	ADMIN_PASSWORD, ADMIN_USER, ADMIN,
} from '../constants';
import {
	UserModel,
	PostModel,
	SymptomModel,
	ConsultationModel,
	StaticModel,
	FoodModel,
} from '../model';
import UserSchemaModel from '../schemas/user';
import ConsultationRequestSchemaModel from '../schemas/consultationRequest';
import { ModelResolver } from './resolvers';

export default {
	authenticate: (req, res) => {
		const { body: { username, password } } = req;
		if (username && password) {
			if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
				return res.send({ code: 100, message: 'Success', accessToken: TokenUtility.generateToken({ role: 'admin', tokenLife: '120d', id: ADMIN, superAdmin: true }) });
			}
			return res.send(ResponseUtility.LOGIN_AUTH_FAILED());
		}
		return res.send(ResponseUtility.MISSING_PROPS({ message: 'Missing username or password.' }));
	},
	stats: (req, res) => ModelResolver(req, res, () => new Promise(async (resolve, reject) => {
		// user stats
		const activeUsers = await UserSchemaModel.countDocuments({ type: 1, deleted: false, blocked: false });
		const deletedUsers = await UserSchemaModel.countDocuments({ type: 1, deleted: true });
		const blocked = await UserSchemaModel.countDocuments({ type: 1, blocked: true, deleted: false });
		const activeStaff = await UserSchemaModel.countDocuments({ type: 2, deleted: false });
		const deletedStaff = await UserSchemaModel.countDocuments({ type: 2, deleted: true });
		const blockedStaff = await UserSchemaModel.countDocuments({ type: 2, blocked: true, deleted: false });
		const totalRequests = await ConsultationRequestSchemaModel.countDocuments({});
		// Users stats
		return resolve(ResponseUtility.SUCCESS({
			data: {
				users: {
					active: activeUsers,
					deleted: deletedUsers,
					blocked,
				},
				staff: {
					totalStaff: activeStaff,
					deleted: deletedStaff,
				},
				totalRequests: {
					request: totalRequests,
				},
			},
		}));
	})),
	listUser: (req, res) => ModelResolver(req, res, UserModel.UsersListAllService),
	listStaff: (req, res) => ModelResolver(req, res, UserModel.UsersListStaffService),
	deleteUser: (req, res) => ModelResolver(req, res, UserModel.UsersDeleteService),
	blockUser: (req, res) => ModelResolver(req, res, UserModel.UsersBlockService),
	listSymptoms: (req, res) => ModelResolver(req, res, SymptomModel.SymptomsListAllService),
	addSymptoms: (req, res) => ModelResolver(req, res, SymptomModel.SymptomsCreateService),
	deleteSymptoms: (req, res) => ModelResolver(req, res, SymptomModel.SymptomsDeleteService),
	updateSymptoms: (req, res) => ModelResolver(req, res, SymptomModel.SymptomsUpdateService),
	listBlogs: (req, res) => ModelResolver(req, res, PostModel.PostsListService),
	addBlogs: (req, res) => ModelResolver(req, res, PostModel.PostsCreateService),
	updateBlog: (req, res) => ModelResolver(req, res, PostModel.PostsUpdateService),
	deleteBlog: (req, res) => ModelResolver(req, res, PostModel.PostsDeleteService),

	listAppointment: (req, res) => ModelResolver(req, res, ConsultationModel.ConsultationsListRequestService),
	actionAppointment: (req, res) => ModelResolver(req, res, ConsultationModel.ConsultationsRequestActionService),
	listSlot: (req, res) => ModelResolver(req, res, ConsultationModel.ConsultationsListSlotService),
	addSlot: (req, res) => ModelResolver(req, res, ConsultationModel.ConsultationsCreateSlotService),
	deleteSlot: (req, res) => ModelResolver(req, res, ConsultationModel.ConsultationsDeleteSlotService),
	createStatic: (req, res) => ModelResolver(req, res, StaticModel.StaticCreateService),
	listStatic: (req, res) => ModelResolver(req, res, StaticModel.StaticListService),
	deleteStatic: (req, res) => ModelResolver(req, res, StaticModel.StaticDeleteService),
	updateStatic: (req, res) => ModelResolver(req, res, StaticModel.StaticUpdateService),
	createFood: (req, res) => ModelResolver(req, res, FoodModel.FoodsCreateService),
	listFood: (req, res) => ModelResolver(req, res, FoodModel.FoodsListAllService),
	deleteFood: (req, res) => ModelResolver(req, res, FoodModel.FoodsDeleteService),
	updateFood: (req, res) => ModelResolver(req, res, FoodModel.FoodsUpdateService),
	commentList: (req,res) => ModelResolver(req, res, PostModel.PostsListCommentsService),
	commentReply: (req,res) => ModelResolver(req, res, PostModel.PostsReplyService),
    commentCreate: (req,res) => ModelResolver(req, res, PostModel.PostsCommentService),

	//gurlal
	createStaff: (req, res) => ModelResolver(req, res, UserModel.UsersCreateService),
	addStaff: (req, res) => ModelResolver(req, res, UserModel.UsersCreateService),
	updateStaff: (req, res) => ModelResolver(req, res, UserModel.UsersUpdateService),
	createPost: (req, res) => ModelResolver(req, res, PostModel.PostsCreateService),
	updatePost: (req, res) => ModelResolver(req, res, PostModel.PostsUpdateService),
	deletePost: (req, res) => ModelResolver(req, res, PostModel.PostsDeleteService),

	listAdminConversations: (req, res) => ModelResolver(req, res, UserModel.UsersListConversationService),
};
