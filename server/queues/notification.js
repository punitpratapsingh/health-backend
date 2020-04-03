import { SendNotificationProcess } from './processes';
/**
 * @description
 * This is the channel that will handle the backend process.
 * The background process must include
 * @author punit
 * @since 4 sep 2019
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
		fcmToken,
		device,
		ref,
		subtitle,
		title,
		type,
		picture,
		payload,
	} = JSON.parse(data.content.toString());
	try {
		if (fcmToken && device && ref) {
		// send the push notification
			try {
				await SendNotificationProcess({
					deviceId: fcmToken,
					device,
					reference: ref,
					title,
					subtitle,
					type,
					picture,
					payload,
				});
			} catch (error) {
				console.log(error);
			}
		} else {
			console.log('something is missing in notification');
		}
	} catch (err) {
		console.log('Error occured while sending notification', err);
	}
};
