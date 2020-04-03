/* eslint-disable no-underscore-dangle */
/* eslint-disable import/named */
// import { S3Services } from 'appknit-backend-bundle';
import { ImageUploadProcess } from './processes';
/**
 * @description
 * This is the channel that will handle the backend process.
 * The background process must include
 * @author punit
 * @since 2 august 2019
 */
export default channel => async (data) => {
	/**
	 * Acknowledge the incoming queue.
	 * Not acknowledging the incoming data will keep the data in
	 * queue and will keep it executing contineously everytime the
	 * RabbitMQ starts.
	 */
	channel.ack(data);
	const {
		name,
		image,
	} = JSON.parse(data.content.toString());
	if (name && image) {
		try {
			await ImageUploadProcess(name, image);
		} catch (err) {
			console.log(err);
		}
	}
};
