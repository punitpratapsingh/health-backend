import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import ConsultationSlotModel from '../../schemas/consultationSlots';
import ConsultationSlotCancelModel from '../../schemas/consultationSlotCancel';
import { USER_TYPE } from '../../constants';
/**
 * @description service model function to handle the cancellation
 * of slots
 * @author punit
 * @since 15 Nov, 2019
 * @param {String} slotId unique id of slot.
 */
export default ({
	id,
	staffRef,
	slotId,
	dateTimeStamp,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!slotId) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const lookupQuery = { staffRef: id, _id: slotId, deleted: false };
		if (staffRef) {
			lookupQuery.staffRef = staffRef;
		}
		const slot = await ConsultationSlotModel.findOne(
			lookupQuery,
		);
		if (!slot) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No Slot found.' }));
		}
		const alreadyCancelled = await ConsultationSlotCancelModel.findOne({
			slotRef: slotId,
			cancelledFor: dateTimeStamp,
		});
		if (alreadyCancelled) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Slot is already cancelled for given date.' }));
		}
		const ConsultationSlotCancelObject = new ConsultationSlotCancelModel({
			slotRef: slotId,
			cancelledFor: dateTimeStamp,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		await ConsultationSlotCancelObject.save();
		return resolve(ResponseUtility.SUCCESS({ message: 'Slot is cancelled.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while canceling Time slot.', error: `${err}` }));
	}
});
