/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import MessageModel from '../../schemas/message';
import UserModel from '../../schemas/user';
import ChannelModel from '../../schemas/channel';

/**
 * @description service model function to list user's conversations.
 * @author punit
 * @since 04 sep 2019
*/
export default ({
	id,
	type,
	userId,
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		console.log(id);
		if (type === 'admin') {
			if (!userId) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
			}
		} else {
			// updated 20th
			// userId = id || userId;
			userId = userId || id;
		}
		const user = await UserModel.findOne({ _id: userId });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user found.' }));
		}
		const channel = await ChannelModel.findOne({ userRef: userId });
		if (!channel) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No channel found.' }));
		}
		const matchQuery = {
			$match: {
				channelRef: channel._id,
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
							as: 'user',
						},
			},
			{
				$unwind:
						{
							path: '$user',
							preserveNullAndEmptyArrays: true,
						},
			},
			{
				$project:
				{
					message: '$message',
					messageId: '$_id',
					name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
					userId: '$user._id',
					userType: '$user.type',
					timeStamp: '$createdOn',
					type: 1,
					read: '$read',
				},
			},
			{
				$sort:
						{
							timeStamp: -1,
						},
			},
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		];
		const conversation = await MessageModel.aggregate(aggregationQuery);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: conversation.reverse(), page, limit }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing conversation.', error: `${err}` }));
	}
});
