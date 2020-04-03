import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
import PostModel from '../../schemas/post';
import {
	USER_TYPE,
	STAFF_ACCESS_LEVEL,
} from '../../constants';

/**
 * @description service model function to handle the deletion
 * of posts
 * @author punit
 * @since 24 august 2019
 * @param {String} id the unique id of user deleting post.
 * @param {String} postId the unique id of post.
 */
export default ({
	id,
	postId,
	type,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!postId) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const lookupQuery = { _id: postId, deleted: false };
		if (type !== 'admin') {
			const user = await UserModel.findOne({ _id: id, type: USER_TYPE.STAFF });
			if (!user) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'No user found.' }));
			}
			// if (user.accessLevel === STAFF_ACCESS_LEVEL.CHAT) {
			// 	return reject(ResponseUtility.GENERIC_ERR({ message: 'You don\'t have acccess to this feature, please contact admin.' }));
			// }
			lookupQuery.userRef = id;
		}
		const post = await PostModel.findOneAndUpdate(
			lookupQuery,
			{ deleted: true },
		);
		if (!post) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No post found.' }));
		}
		return resolve(ResponseUtility.SUCCESS({ message: 'Post is deleted.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while deleting post.', error: `${err}` }));
	}
});
