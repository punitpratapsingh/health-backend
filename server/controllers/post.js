/**
 * @description controllers for post
 * @author punit
 * @since 24 August 2019
 */
import {
	PostModel,
} from '../model';
import { ModelResolver } from './resolvers';

export default {
	create: (req, res) => ModelResolver(req, res, PostModel.PostsCreateService),
	update: (req, res) => ModelResolver(req, res, PostModel.PostsUpdateService),
	list: (req, res) => ModelResolver(req, res, PostModel.PostsListService),
	commentList: (req, res) => ModelResolver(req, res, PostModel.PostsListCommentsService),
	replyList: (req, res) => ModelResolver(req, res, PostModel.PostsListRepliesService),
	delete: (req, res) => ModelResolver(req, res, PostModel.PostsDeleteService),
	comment: (req, res) => ModelResolver(req, res, PostModel.PostsCommentService),
	reply: (req, res) => ModelResolver(req, res, PostModel.PostsReplyService),
};
