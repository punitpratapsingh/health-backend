import {
	ResponseUtility,
	SchemaMapperUtility,
} from 'appknit-backend-bundle';
import {
	TimeDiffService,
} from '../../services';
import { Types } from 'mongoose';
import ConsultationSlotModel from '../../schemas/consultationSlots';
import { USER_TYPE } from '../../constants';
/**
 * @description service model function to handle the updation
 * of slots
 * @author punit
 * @since 26 august 2019
 * @param {String} slotId unique id of time slot.
 * @param {Number} fromTimeHour the from time hour.
 * @param {Number} fromTimeMinute the from time minute.
 * @param {Number} toTimeHour the to time hout.
 * @param {Number} toTimeMinute the to time minute.
 */
export default ({
	id,
	slotId,
	staffRef,
	fromTimeHour,
	fromTimeMinute,
	toTimeHour,
	toTimeMinute,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!slotId
		|| !((fromTimeHour || fromTimeHour === 0)
		&& (fromTimeMinute || fromTimeMinute === 0)
		&& (toTimeHour || toTimeHour === 0)
		&& (toTimeMinute || toTimeMinute === 0))) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const lookupQuery = { _id: slotId, staffRef: id, deleted: false };
		if (staffRef) {
			lookupQuery.staffRef = staffRef;
		}
		const slot = await ConsultationSlotModel.findOne(lookupQuery);
		if (!slot) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No slot found.' }));
		}
		if ((fromTimeHour > 23) || (fromTimeHour < 0)
		||	(fromTimeMinute > 59) || (fromTimeMinute < 0)
		||	(toTimeHour > 23) || (toTimeHour < 0)
		||	(toTimeMinute > 59) || (toTimeMinute < 0)
		) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid input data.' }));
		}
		const timeOne = {};
		const timeTwo = {};
		if (fromTimeHour) {
			timeOne.hour = fromTimeHour;
		} else {
			timeOne.hour = slot.fromTimeHour;
		}
		if (fromTimeMinute) {
			timeOne.minute = fromTimeMinute;
		} else {
			timeOne.minute = slot.fromTimeMinute;
		}
		if (toTimeHour) {
			timeTwo.hour = toTimeHour;
		} else {
			timeTwo.hour = slot.toTimeHour;
		}
		if (toTimeMinute) {
			timeTwo.minute = toTimeMinute;
		} else {
			timeTwo.minute = slot.toTimeMinute;
		}
		const givenFromDate = new Date(2000, 0, 1, timeOne.hour, timeOne.minute, 0, 0).getTime() + 19800000;
		const givenToDate = new Date(2000, 0, 1, timeTwo.hour, timeTwo.minute, 0, 0).getTime() + 19800000;
		const timeOverlap = await ConsultationSlotModel.aggregate([
			{
				$match: {
					staffRef: Types.ObjectId.createFromHexString(id),
					deleted: false,
				},
			},
			{
				$project: {
					fromTimeHour: '$fromTimeHour',
					fromTimeMinute: '$fromTimeMinute',
					toTimeHour: '$toTimeHour',
					toTimeMinute: '$toTimeMinute',
					date1970: new Date(2000, 0, 0, '$fromTimeHour', '$fromTimeMinute', 0, 0),
					fromDate: {
						$dateFromParts: {
							year: 2000,
							month: 1,
							day: 1,
							hour: '$fromTimeHour',
							minute: '$fromTimeMinute',
							second: 0,
							millisecond: 0,
						},
					},
					toDate: {
						$dateFromParts: {
							year: 2000,
							month: 1,
							day: 1,
							hour: '$toTimeHour',
							minute: '$toTimeMinute',
							second: 0,
							millisecond: 0,
						},
					},
				},
			},
			{
				$project: {
					fromDateTimestamp: { $subtract: ['$fromDate', '$date1970'] },
					toDateTimestamp: { $subtract: ['$toDate', '$date1970'] },
				},
			},
			{
				$match: {
					$or: [
						{
							fromDateTimestamp: { $eq: givenFromDate },
						},
						{
							toDateTimestamp: { $eq: givenToDate },
						},
						{
							fromDateTimestamp: { $gt: givenFromDate, $lt: givenToDate },
						},
						{
							fromDateTimestamp: { $lt: givenFromDate },
							toDateTimestamp: { $gt: givenFromDate },
						},
					],
				},
			},
		]);
		if (timeOverlap.length) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Time is overlaping with another slot.' }));
		}
		const duration = TimeDiffService({ timeOne, timeTwo });
		const updateQuery = await SchemaMapperUtility({
			fromTimeHour,
			fromTimeMinute,
			toTimeHour,
			toTimeMinute,
			duration,
			updatedOn: new Date(),
		});
		await ConsultationSlotModel.updateOne({ _id: slotId }, updateQuery);
		return resolve(ResponseUtility.SUCCESS({ message: 'Time Slot is updated.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while updating Time slot.', error: `${err}` }));
	}
});
