import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import ConsultationSlotModel from '../../schemas/consultationSlots';
import { USER_TYPE } from '../../constants';
/**
 * @description service model function to handle the cancellation
 * of slots
 * @author punit
 * @since 15 Noc, 2019
 * @param {String} slotId unique id of slot.
 */
export default ({
	id,
	staffRef,
	slotId,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!slotId) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const lookupQuery = { staffRef: id, deleted: false };
		if (staffRef) {
			lookupQuery.staffRef = staffRef;
		}
		const slot = await ConsultationSlotModel.findOneAndUpdate(
			lookupQuery,
			{ deleted: true },
		);
		if (!slot) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No Slot found.' }));
		}
		return resolve(ResponseUtility.SUCCESS({ message: 'Slot is Cancel.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while cancelling Time slot.', error: `${err}` }));
	}
});
