import {
	ResponseUtility,
	RandomCodeUtility,
} from 'appknit-backend-bundle';
import SymptomModel from '../../schemas/symptom';
import { AMQP_QUEUES } from '../../constants';

/**
 * @description service model function to handle the creation
 * of symptoms
 * @author punit
 * @since 3 Sep 2019
 * @param {String} name the name of the symptom.
 * @param {String} overview the overview of the symptom.
 * @param {Array} causes the causes of the symptom.
 * @param {Object} image the icon image of the symptom.
 * @param {Object} coverImage the cover image of the symptom.
 * @param {Object} AMQPChannel the AMQP channel object for calling queue.
 */
export default ({
	name,
	overview,
	potentialDiseases,
	recommendation,
	image,
	coverImage,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(name && overview && potentialDiseases && recommendation && image && coverImage)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const picture = `symptom/${Date.now() * RandomCodeUtility(3)}`;
		AMQPChannel.sendToQueue(
			AMQP_QUEUES.IMAGE_UPLOAD,
			Buffer.from(JSON.stringify({
				name: picture,
				image,
			})),
		);
		const coverPicture = `symptom/${Date.now() * RandomCodeUtility(3)}`;
		AMQPChannel.sendToQueue(
			AMQP_QUEUES.IMAGE_UPLOAD,
			Buffer.from(JSON.stringify({
				name: coverPicture,
				image: coverImage,
			})),
		);
		const SymptomObject = new SymptomModel({
			name,
			overview,
			potentialDiseases,
			recommendation,
			picture,
			coverPicture,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		await SymptomObject.save();
		return resolve(ResponseUtility.SUCCESS({ message: 'New symptom is Saved.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while saving symptom.', error: `${err}` }));
	}
});
