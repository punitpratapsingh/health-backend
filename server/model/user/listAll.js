import { ResponseUtility } from 'appknit-backend-bundle';
import { UserModel } from '../../schemas';
/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 19 October, 2019 10:47:41
*/
export default ({
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		const options = { skip: limit * (page - 1), limit };
		const users = await UserModel.find(
            { $and: [{ deleted: false }, { type: 1 }] },
			{ __v: 0 },
			options,
		);
		const refactoredResponses = [];

		users.map(user => refactoredResponses.push(Object.assign({}, { ...user._doc })));
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: refactoredResponses, page, limit }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing users.', error: `${err}` }));
	}
});


