import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import ConsultationSlotModel from '../../schemas/consultationSlots';
import ConsultationRequestModel from '../../schemas/consultationRequest';
import ConsultationSlotCancelModel from '../../schemas/consultationSlotCancel';
import UserModel from '../../schemas/user';
import {
	USER_TYPE,
	CONSULTATION_REQ_STATUS,
} from '../../constants';

/**
 * @description service model function to handle the request of
 * consultation
 * @author punit
 * @since 26 august 2019
 * @param {String} id unique id of user making request.
 * @param {String} slotId unique id of time slot.
 * @param {String} diseaseDescription description of the problem for which
 * the request is being made.
 */
export default ({
	id,
	slotId,
	dateTimeStamp,
	diseaseDescription,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(slotId && dateTimeStamp && diseaseDescription)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const user = await UserModel.findOne({ _id: id, type: USER_TYPE.USER });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user found.' }));
		}
		const slot = await ConsultationSlotModel.findOne({ _id: slotId, deleted: false });
		if (!slot) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No Slot found.' }));
		}
		// const slotRequested = await ConsultationRequestModel.findOne({
		// 	slotRef: slotId,
		// 	bookedFor: dateTimeStamp,
		// 	requestingUser: id,
		// });
		// if (slotRequested) {
		// 	return reject(ResponseUtility.GENERIC_ERR({ message: 'This slot is already booked.' }));
		// }
		const slotRequested = await ConsultationRequestModel.findOne({
			slotRef: slotId,
			bookedFor: dateTimeStamp,
			status: { $ne: CONSULTATION_REQ_STATUS.REJECTED },
		});
		if (slotRequested) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'This slot is already booked.' }));
		}
		// if (slotRequested) {
		// 	if (slotRequested.status === CONSULTATION_REQ_STATUS.ACCEPTED)	{
		// 		return reject(ResponseUtility.GENERIC_ERR({ message: 'Your have already booked this slot.' }));
		// 	}
		// 	if (slotRequested.status === CONSULTATION_REQ_STATUS.PENDING)	{
		// 		return reject(ResponseUtility.GENERIC_ERR({ message: 'Your have already requested this slot.' }));
		// 	}
		// }
		const slotCancelled = await ConsultationSlotCancelModel.findOne({
			slotRef: slotId,
			cancelledFor: dateTimeStamp,
		});
		if (slotCancelled) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Your requested slot is not available for given date.' }));
		}
		// const slotBooked = await ConsultationRequestModel.findOne({
		// 	slotRef: slotId,
		// 	bookedFor: dateTimeStamp,
		// 	status: CONSULTATION_REQ_STATUS.ACCEPTED,
		// });
		// if (slotBooked) {
		// 	return reject(ResponseUtility.GENERIC_ERR({ message: 'Your requested slot is already booked.' }));
		// }
		const ConsultationRequestObject = new ConsultationRequestModel({
			slotRef: slotId,
			requestingUser: id,
			bookedFor: dateTimeStamp,
			diseaseDescription,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		await ConsultationRequestObject.save();
		return resolve(ResponseUtility.SUCCESS({ message: 'Consultation Request is saved.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while posting Consultation Request.', error: `${err}` }));
	}
});
