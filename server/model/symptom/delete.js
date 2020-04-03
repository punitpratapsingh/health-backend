import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import SymptomModel from '../../schemas/symptom';
import { AMQP_QUEUES } from '../../constants';

/**
 * @description service model function to handle the deletion
 * of symptoms
 * @author punit
 * @since 3 Sep 2019
 * @param {String} symptomId the unique id of the symptom.
 * @param {Object} AMQPChannel the AMQP channel object for calling queue.
 */
export default ({
	symptomId,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!symptomId) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const symptom = await SymptomModel.findOneAndDelete({ _id: symptomId });
		if (!symptom) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No symptom found.' }));
		}
		if (symptom.picture) {
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.PICTURE_DELETE,
				Buffer.from(JSON.stringify({
					name: symptom.picture,
				})),
			);
		}
		if (symptom.coverPicture) {
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.PICTURE_DELETE,
				Buffer.from(JSON.stringify({
					name: symptom.coverPicture,
				})),
			);
		}
		return resolve(ResponseUtility.SUCCESS({ message: 'symptom is deleted.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while deleting symptom.', error: `${err}` }));
	}
});
