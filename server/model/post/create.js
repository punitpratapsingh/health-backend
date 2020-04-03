import {
	ResponseUtility,
	RandomCodeUtility,
} from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
import PostModel from '../../schemas/post';
import {
	USER_TYPE,
	AMQP_QUEUES,
	STAFF_ACCESS_LEVEL,
} from '../../constants';

/**
 * @description service model function to handle the creation
 * of posts
 * @author punit
 * @since 24 august 2019
 * @param {String} id the unique id of user creating post.
 * @param {String} title the title of the post.
 * @param {String} content the content of the post.
 * @param {Object} image the image of the post.
 * @param {Object} AMQPChannel the AMQP channel object for calling queue.
 */
export default ({
	id,
	userId,
	title,
	content,
	image,
	AMQPChannel,
	type,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(title && content && image)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		console.log(userId);
		console.log(type);
		if (type === 'admin') {
			id = userId;
		}
		const user = await UserModel.findOne({ _id: id, type: USER_TYPE.STAFF });
		console.log(user);
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user found.' }));
		}
		// if (user.accessLevel === STAFF_ACCESS_LEVEL.CHAT) {
		// 	return reject(ResponseUtility.GENERIC_ERR({ message: 'You don\'t have acccess to this feature, please contact admin.' }));
		// }
		let picture;
		if (image) {
			picture = `post/${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: picture,
					image,
				})),
			);
		}
		const postObject = new PostModel({
			userRef: id,
			title,
			content,
			picture,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		await postObject.save();
		return resolve(ResponseUtility.SUCCESS({ message: 'New post is created.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while creating post.', error: `${err}` }));
	}
});
