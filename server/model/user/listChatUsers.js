/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';

/**
 * @description service model function to list user's conversations
 * the user that sent the last message will be on top.
 * @author punit
 * @since 04 sep 2019
*/
export default ({
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		const aggregationQuery = [
			{
				$match: {
					type: 1,
				},
			},
			{
				$lookup:
				{
					from: 'channels',
					localField: '_id',
					foreignField: 'userRef',
					as: 'channels',
				},
			},
			{
				$unwind:
				{
					path: '$channels',
				},
			},
			{
				$lookup:
				{
					from: 'messages',
					localField: 'channels._id',
					foreignField: 'channelRef',
					as: 'messgaes',
				},
			},
			{
				$unwind:
				{
					path: '$messgaes',
				},
			},
			{
				$sort:
				{
					'messgaes.createdOn': -1,
				},
			},
			{
				$group: {
					_id: '$_id',
					online: { $first: '$online' },
					firstName: { $first: '$firstName' },
					lastName: { $first: '$lastName' },
					email: { $first: '$email' },
					phoneCode: { $first: '$phoneCode' },
					phoneNumber: { $first: '$phoneNumber' },
					message: {
						$first: {
							_id: '$messgaes._id',
							channelRef: '$messgaes.messgaes',
							createdOn: '$messgaes.createdOn',
							message: '$messgaes.message',
						},
					},
				},
			},
			{
				$sort:
				{
					'message.createdOn': 1,
				},
			},
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		];
		const conversation = await UserModel.aggregate(aggregationQuery);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: conversation.reverse(), page, limit }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing conversation.', error: `${err}` }));
	}
});
