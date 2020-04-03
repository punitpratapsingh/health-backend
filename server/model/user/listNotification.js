/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import NotificationModel from '../../schemas/notification';
import UserModel from '../../schemas/user';

/**
 * @description service model function to list user's notifications.
 * @author punit
 * @since 04 sep 2019
*/
export default ({
	id,
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user found.' }));
		}
		const matchQuery = {
			$match: {
				notificationFor: Types.ObjectId.createFromHexString(id),
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
					_id: '$_id',
					ref: '$ref',
					type: '$type',
					text: '$text',
					date: '$date',
					timestamp: '$timestamp',
					userRef: '$userRef',
					boldText: { $ifNull: [{ $concat: ['$replyUser.firstName', ' ', '$replyUser.lastName'] }, 'Admin'] },
					notificationFor: '$notificationFor',
					name: { $ifNull: [{ $concat: ['$replyUser.firstName', ' ', '$replyUser.lastName'] }, 'Admin'] },
					picture: { $ifNull: ['$replyUser.picture', 'Admin'] },
				},
			},
			{
				$lookup:
						{
							from: 'comments',
							localField: 'ref',
							foreignField: '_id',
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
					boldText: '$boldText',
					ref: '$ref',
					type: '$type',
					text: '$text',
					date: '$date',
					timestamp: '$timestamp',
					userRef: '$userRef',
					notificationFor: '$notificationFor',
					name: '$name',
					picture: '$picture',
					comment: {
						_id: '$comment._id',
						comment: '$comment.comment',
						createdOn: '$comment.createdOn',
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
			{
				$lookup:
						{
							from: 'replies',
							localField: 'comment._id',
							foreignField: 'commentRef',
							as: 'reply',
						},
			},
			// {
			// 	$unwind:
			// 			{
			// 				path: '$reply',
			// 				preserveNullAndEmptyArrays: true,
			// 			},
			// },
			// {
			// 	$sort:
			// 			{
			// 				'reply.createdOn': -1,
			// 			},
			// },
			// {
			// 	$group:
			// 	{
			// 		_id: '$_id',
			// 		boldText: { $first: '$boldText' },
			// 		ref: { $first: '$ref' },
			// 		type: { $first: '$type' },
			// 		text: { $first: '$text' },
			// 		date: { $first: '$date' },
			// 		timestamp: { $first: '$timestamp' },
			// 		userRef: { $first: '$userRef' },
			// 		notificationFor: { $first: '$notificationFor' },
			// 		name: { $first: '$name' },
			// 		picture: { $first: '$picture' },
			// 		comment: { $first: '$comment' },
			// 		replies: {
			// 			$push: {
			// 				_id: '$reply._id',
			// 			},
			// 		},
			// 	},
			// },
			// {
			// 	$project:
			// 	{
			// 		_id: '$_id',
			// 		userDetails: '$userDetails',
			// 		boldText: '$boldText',
			// 		ref: '$ref',
			// 		type: '$type',
			// 		text: '$text',
			// 		date: '$date',
			// 		timestamp: '$timestamp',
			// 		userRef: '$userRef',
			// 		notificationFor: '$notificationFor',
			// 		name: '$name',
			// 		picture: '$picture',
			// 		comment: '$comment',
			// 		replies: {
			// 			$filter: {
			// 				input: '$replies',
			// 				as: 'replies',
			// 				cond: { $gt: ['$$replies._id', null] },
			// 			},
			// 		},
			// 	},
			// },
			{
				$project:
				{
					_id: '$_id',
					userDetails: '$userDetails',
					boldText: '$boldText',
					ref: '$ref',
					type: '$type',
					text: '$text',
					date: '$date',
					timestamp: '$timestamp',
					userRef: '$userRef',
					notificationFor: '$notificationFor',
					name: '$name',
					picture: '$picture',
					comment: {
						_id: '$comment._id',
						comment: '$comment.comment',
						createdOn: '$comment.createdOn',
						userDetails:
							{
								_id: '$comment.userDetails._id',
								firstName: '$comment.userDetails.firstName',
								lastName: '$comment.userDetails.lastName',
								email: '$comment.userDetails.email',
								picture: '$comment.userDetails.picture',
							},
						replyCount: { $size: '$reply' },
					},
				},
			},
			{
				$sort: {
					timestamp: -1,
				},
			},
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		];

		const notifications = await NotificationModel.aggregate(aggregationQuery);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: notifications, page, limit }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing notifications.', error: `${err}` }));
	}
});
