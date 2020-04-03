import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import PostModel from '../../schemas/post';

/**
 * @description service model function to handle the listing
 * of posts
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
		const matchQuery = {
			$match:
			{
				deleted: false,
			},
		};
		if (postId) {
			matchQuery.$match._id = Types.ObjectId.createFromHexString(postId);
		}
		const aggregationQuery = [
			matchQuery,
			{
				$lookup:
							{
								from: 'users',
								localField: 'userRef',
								foreignField: '_id',
								as: 'postUser',
							},
			},
			{
				$unwind:
							{
								path: '$postUser',
								preserveNullAndEmptyArrays: true,
							},
			},
			{
				$lookup:
							{
								from: 'comments',
								localField: '_id',
								foreignField: 'postRef',
								as: 'comment',
							},
			},
			{
				$unwind:
							{
								path: '$comment',
								preserveNullAndEmptyArrays: true,
							},
			},
			{
				$lookup:
							{
								from: 'comments',
								localField: '_id',
								foreignField: 'postRef',
								as: 'comment',
							},
			},
			{
				$unwind:
							{
								path: '$comment',
								preserveNullAndEmptyArrays: true,
							},
			},
			{
				$lookup:
							{
								from: 'replies',
								localField: 'comment._id',
								foreignField: 'commentRef',
								as: 'replies',
							},
			},
			{
				$lookup:
							{
								from: 'users',
								localField: 'comment.userRef',
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
				$project:
				{
					_id: '$_id',
					title: '$title',
					content: '$content',
					picture: '$picture',
					createdOn: '$createdOn',
					updatedOn: '$updatedOn',
					comments: '$comment',
					commentUser: '$commentUser',
					// replies: '$replies',
					replyCount: { $size: '$replies' },
				},
			},
			{
				$sort: {
					'comment.createdOn': -1,
				},
			},
			{
				$group:
				{
					_id: '$_id',
					title: { $first: '$title' },
					content: { $first: '$content' },
					picture: { $first: '$picture' },
					createdOn: { $first: '$createdOn' },
					updatedOn: { $first: '$updatedOn' },
					comments: {
						$push: {
							_id: '$comments._id',
							comment: '$comments.comment',
							createdOn: '$comments.createdOn',
							postRef: '$comments.postRef',
							// replies: '$replies',
							replyCount: '$replyCount',
							userDetails:
									{
										_id: '$commentUser._id',
										firstName: '$commentUser.firstName',
										lastName: '$commentUser.lastName',
										email: '$commentUser.email',
										picture: '$commentUser.picture',
									},
						},
					},
				},
			},
			{
				$project:
				{
					_id: '$_id',
					title: '$title',
					content: '$content',
					picture: '$picture',
					createdOn: '$createdOn',
					updatedOn: '$updatedOn',
					comments: {
						$filter: {
							input: '$comments',
							as: 'comments',
							cond: { $gt: ['$$comments._id', null] },
						},
					},
				},
			},
			{
				$sort: {
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
		const data = await PostModel.aggregate(aggregationQuery);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, page, limit }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing posts.', error: `${err}` }));
	}
});
