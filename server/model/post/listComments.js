import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import CommentModel from '../../schemas/comment';

/**
 * @description service model function to handle the listing
 * of comments
 * @author punit
 * @since 24 august 2019
 * @param {String} postId the unique id of post.
 * @param {Number} page for pagination page represents page number of results shown.
 * @param {Number} limit for pagination limit represents number of results per page.
 */
export default ({
	postId,
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!postId) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const matchQuery = {
			$match:
			{
				deleted: false,
				postRef: Types.ObjectId.createFromHexString(postId),
			},
		};
		const aggregationQuery = [
			matchQuery,
			{
				$lookup:
						{
							from: 'users',
							localField: 'userRef',
							foreignField: '_id',
							as: 'commentUser',
						},
			},
			{
				$unwind:
						{
							path: '$commentUser',
							preserveNullAndEmptyArrays: true,
						},
			},
			{
				$lookup:
						{
							from: 'replies',
							localField: '_id',
							foreignField: 'commentRef',
							as: 'reply',
						},
			},
			{
				$unwind:
						{
							path: '$reply',
							preserveNullAndEmptyArrays: true,
						},
			},
			{
				$lookup:
						{
							from: 'users',
							localField: 'reply.userRef',
							foreignField: '_id',
							as: 'replyUser',
						},
			},
			{
				$unwind:
						{
							path: '$replyUser',
							preserveNullAndEmptyArrays: true,
						},
			},
			{
				$sort:
						{
							'reply.createdOn': -1,
						},
			},
			{
				$group:
				{
					_id: '$_id',
					comment: { $first: '$comment' },
					createdOn: { $first: '$createdOn' },
					userDetails:
							{
								$first: {
									_id: '$commentUser._id',
									firstName: '$commentUser.firstName',
									lastName: '$commentUser.lastName',
									email: '$commentUser.email',
									picture: '$commentUser.picture',
								},
							},
					replyCount: { $sum: 1 },
					replies: {
						$push: {
							_id: '$reply._id',
							reply: '$reply.reply',
							createdOn: '$reply.createdOn',
							userDetails:
								{
									_id: '$replyUser._id',
									firstName: '$replyUser.firstName',
									lastName: '$replyUser.lastName',
									email: '$replyUser.email',
									picture: '$replyUser.picture',
								},
						},
					},
				},
			},
			{
				$sort:
						{
							createdOn: -1,
						},
			},
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		];
		const data = await CommentModel.aggregate(aggregationQuery);
		data.forEach((element, index) => {
			if (!element.replies[0].userDetails.firstName) {
				data[index].replyCount = 0;
			}
			data[index].replies = element.replies
				.filter(reply => reply._id != undefined);
		});
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, page, limit }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing comments of a post.', error: `${err}` }));
	}
});
