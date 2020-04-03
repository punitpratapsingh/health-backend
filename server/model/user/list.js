/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import UserModel from '../../schemas/user';
import { USER_TYPE } from '../../constants';
/**
 * @description service model function to list users.
 * @author punit
 * @since 26 august 2019
*/
export default ({
	userId,
	type,
	role,
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		const matchQuery = { $match: {} };
		if (userId) {
			matchQuery.$match._id = Types.ObjectId.createFromHexString(userId);
		}
		if (role) {
			matchQuery.$match.type = role;
		}
		if (type === 'user') {
			matchQuery.$match.type = USER_TYPE.STAFF;
		}
		matchQuery.$match.blocked = false;
		matchQuery.$match.deleted = false;
		const aggregationQuery = [
			matchQuery,
			{
				$project:
				{
					password: 0,
					blocked: 0,
					deleted: 0,
					__v: 0,
					device: 0,
					fcmToken: 0,
					changePassToken: 0,
					changePassTokenDate: 0,
				},
			},
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		];

		const users = await UserModel.aggregate(aggregationQuery);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: users, page, limit }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing users.', error: `${err}` }));
	}
});
