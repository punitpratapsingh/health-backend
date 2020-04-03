import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import ReplyModel from '../../schemas/reply';

/**
 * @description service model function to handle the listing
 * of replies
 * @author punit
 * @since 31 august 2019
 * @param {String} commentId the unique id of comment.
 * @param {Number} page for pagination page represents page number of results shown.
 * @param {Number} limit for pagination limit represents number of results per page.
 */
export default ({
	commentId,
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!commentId) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const matchQuery = {
			$match:
			{
				deleted: false,
				commentRef: Types.ObjectId.createFromHexString(commentId),
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
				$project:
				{
					commentId: '$commentRef',
					replyId: '$_id',
					_id: '$_id',
					reply: '$reply',
					createdOn: '$createdOn',
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
		const data = await ReplyModel.aggregate(aggregationQuery);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, page, limit }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing replies of a comment.', error: `${err}` }));
	}
});
