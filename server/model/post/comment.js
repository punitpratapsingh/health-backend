import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import UserModel from '../../schemas/user';
import CommentModel from '../../schemas/comment';
import PostModel from '../../schemas/post';

/**
 * @description service model function to handle the comments
 * on posts
 * @author punit
 * @since 26 august 2019
 * @param {String} id the unique id of user making comment.
 * @param {String} postId the unique id of post to make comment on.
 * @param {String} comment the comment that is to be posted.
 */
export default ({
	id,
	postId,
	comment,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(postId && comment)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user found.' }));
		}
		const post = await PostModel.findOne({ _id: postId });
		if (!post) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No post found.' }));
		}
		const CommentObject = new CommentModel({
			userRef: id,
			postRef: postId,
			comment,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		await CommentObject.save();
		const [data] = await CommentModel.aggregate([
			{
				$match: {
					_id: CommentObject._id,
				},
			},
			{
				$lookup:
						{
							from: 'users',
							localField: 'userRef',
							foreignField: '_id',
							as: 'userDetails',
						},
			},
			{
				$unwind:
						{
							path: '$userDetails',
							preserveNullAndEmptyArrays: true,
						},
			},
			{
				$project: {
					_id: '$_id',
					comment: '$comment',
					createdOn: '$createdOn',
					userDetails: {
						_id: '$userDetails._id',
						firstName: '$userDetails.firstName',
						email: '$userDetails.email',
						picture: '$userDetails.picture',
					},
				},
			},
		]);
		return resolve(ResponseUtility.SUCCESS({
			message: 'Your comment is posted.',
			data: {
				...data,
				replyCount: 0,
			},
		}));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while posting comment.', error: `${err}` }));
	}
});
