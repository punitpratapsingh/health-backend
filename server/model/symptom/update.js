import {
	ResponseUtility,
	SchemaMapperUtility,
	RandomCodeUtility,
} from 'appknit-backend-bundle';
import SymptomModel from '../../schemas/symptom';
import { AMQP_QUEUES } from '../../constants';

/**
 * @description service model function to handle the updation
 * of symptoms
 * @author punit
 * @since 3 Sep 2019
 * @param {String} symptomId the unique id of the symptom.
 * @param {String} name the name of the symptom.
 * @param {String} overview the overview of the symptom.
 * @param {Array} causes the causes of the symptom.
 * @param {Object} image the icon image of the symptom.
 * @param {Object} coverImage the cover image of the symptom.
 * @param {Object} AMQPChannel the AMQP channel object for calling queue.
 */
export default ({
	symptomId,
	name,
	overview,
	potentialDiseases,
	recommendation,
	image,
	coverImage,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		console.log(image);
		
		if (!symptomId
		|| !(name || overview || potentialDiseases || recommendation || image || coverImage)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const symptom = await SymptomModel.findOne({ _id: symptomId });
		if (!symptom) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No symptom found.' }));
		}
		let picture;
		let coverPicture;
		if (image) {
			if (symptom.picture) {
				AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: symptom.picture,
					})),
				);
			}
			picture = `symptom/${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: picture,
					image,
				})),
			);
		}
		if (coverImage) {
			if (symptom.coverPicture) {
				AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: symptom.coverPicture,
					})),
				);
			}
			coverPicture = `symptom/${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: coverPicture,
					image: coverImage,
				})),
			);
		}
		const updateQuery = await SchemaMapperUtility({
			symptomId,
			name,
			overview,
			potentialDiseases,
			recommendation,
			picture,
			coverPicture,
			updatedOn: new Date(),
		});
		await SymptomModel.findOneAndUpdate({ _id: symptomId }, updateQuery);
		return resolve(ResponseUtility.SUCCESS({ message: 'symptom is updated.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while updating symptom.', error: `${err}` }));
	}
});
