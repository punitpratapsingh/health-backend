import {
	ResponseUtility,
	SchemaMapperUtility,
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
 * @description service model function to handle the updations
 * of posts
 * @author punit
 * @since 24 august 2019
 * @param {String} id the unique id of user updating post.
 * @param {String} postId the unique id of post.
 * @param {String} title the title of the post.
 * @param {String} content the content of the post.
 * @param {Object} image the image of the post.
 * @param {Object} AMQPChannel the AMQP channel object for calling queue.
 */
export default ({
	id,
	postId,
	title,
	content,
	image,
	AMQPChannel,
	type,
}) => new Promise(async (resolve, reject) => {
	try {
		console.log(image);
		console.log(title);
		if (!postId
		|| !(content || title || image)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const lookupQuery = { _id: postId };
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
		const post = await PostModel.findOne(lookupQuery);
		if (!post) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No post found.' }));
		}
		let picture;
		if (image) {
			if (post.picture) {
				AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: post.picture,
					})),
				);
			}
			picture = `post/${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: picture,
					image,
				})),
			);
		}
		const updateQuery = await SchemaMapperUtility({
			title,
			content,
			picture,
			updatedOn: new Date(),
		});
		await PostModel.findByIdAndUpdate(
			{ _id: postId },
			updateQuery,
			{ new: true },
		);
		return resolve(ResponseUtility.SUCCESS({ message: 'Post is updated.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while updating posts.', error: `${err}` }));
	}
});
