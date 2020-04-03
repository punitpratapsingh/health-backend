import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
import CommentModel from '../../schemas/comment';
import ReplyModel from '../../schemas/reply';
import NotificationModel from '../../schemas/notification';
import { NOTIFICATION_TYPE, AMQP_QUEUES, USER_TYPE } from '../../constants';

/**
 * @description service model function to handle the replies
 * on comments
 * @author punit
 * @since 26 august 2019
 * @param {String} id the unique id of user replying.
 * @param {String} commentId the unique id of comment.
 * @param {String} reply the reply to be posted.
 * @param {Object} AMQPChannel the AMQP channel object for calling queue.
 */
export default ({
	id,
	commentId,
	reply,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(commentId && reply)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user found.' }));
		}
		let comment = await CommentModel.findOne({ _id: commentId });
		if (!comment) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No comment found.' }));
		}
		if (user.type === USER_TYPE.USER) {
			if ((comment.userRef).toString() !== id) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Users can only reply to own questions.' }));
			}
		}
		const ReplyObject = new ReplyModel({
			userRef: id,
			commentRef: commentId,
			reply,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		await ReplyObject.save();
		const [data] = await ReplyModel.aggregate([
			{
				$match: {
					_id: ReplyObject._id,
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
					commentId: '$commentRef',
					reply: '$reply',
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
		const replies = await ReplyModel.find({ commentRef: comment._id });
		const commentUser = await UserModel.findOne({ _id: comment.userRef });
		const commentUserDetails = {
			_id: commentUser._id,
			firstName: commentUser.firstName,
			lastName: commentUser.lastName,
			email: commentUser.email,
			picture: commentUser.picture,
		};
		comment = {
			comment: {
				...comment._doc,
				replyCount: replies.length,
				userDetails: commentUserDetails,
			},
		};
		if (commentUser._id != user._id) {
			const notification = new NotificationModel({
				ref: commentId,
				type: NOTIFICATION_TYPE.POST,
				text: 'has replied on your Question.',
				boldText: '',
				date: new Date(),
				timestamp: new Date(),
				userRef: id,
				notificationFor: commentUser._id,
			});
			await notification.save();
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.NOTIFICATION,
				Buffer.from(JSON.stringify({
					fcmToken: commentUser.fcmToken,
					device: commentUser.device,
					ref: commentId,
					subtitle: 'has replied on your Question.',
					title: `${user.firstName} ${user.lastName}`,
					type: NOTIFICATION_TYPE.POST,
					picture: user.picture,
					payload: comment,
				})),
			);
		}
		return resolve(ResponseUtility.SUCCESS({ message: 'Your reply is posted.', data }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while posting reply.', error: `${err}` }));
	}
});
