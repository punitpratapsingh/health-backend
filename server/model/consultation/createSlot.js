import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import {
	TimeDiffService,
} from '../../services';
import ConsultationSlotModel from '../../schemas/consultationSlots';
import UserModel from '../../schemas/user';
import { USER_TYPE } from '../../constants';
/**
 * @description service model function to handle the creation
 * of slots
 * @author punit
 * @since 26 august 2019
 * @param {String} staffRef the unique id of staff.
 * @param {Number} fromTimeHour the from time hour.
 * @param {Number} fromTimeMinute the from time minute.
 * @param {Number} toTimeHour the to time hout.
 * @param {Number} toTimeMinute the to time minute.
 */
export default ({
	id,
	staffRef,
	fromTimeHour,
	fromTimeMinute,
	toTimeHour,
	toTimeMinute,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!((fromTimeHour || fromTimeHour === 0)
		&& (fromTimeMinute || fromTimeMinute === 0)
		&& (toTimeHour || toTimeHour === 0)
		&& (toTimeMinute || toTimeMinute === 0))) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		const lookupQuery = { _id: id, type: USER_TYPE.STAFF };
		if (staffRef) {
			lookupQuery._id = staffRef;
		}
		const staff = await UserModel.findOne(lookupQuery);
		if (!staff) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'User not found.' }));
		}
		if ((fromTimeHour > 23) || (fromTimeHour < 0)
		||	(fromTimeMinute > 59) || (fromTimeMinute < 0)
		||	(toTimeHour > 23) || (toTimeHour < 0)
		||	(toTimeMinute > 59) || (toTimeMinute < 0)
		) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid input data.' }));
		}
		const givenFromDate = new Date(2000, 0, 1, fromTimeHour, fromTimeMinute, 0, 0).getTime();
		const givenToDate = new Date(2000, 0, 1, toTimeHour, toTimeMinute, 0, 0).getTime();
		const timeOverlap = await ConsultationSlotModel.aggregate([
			{
				$match: {
					staffRef: staff._id,
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
		const duration = TimeDiffService(
			{
				timeOne: {
					hour: fromTimeHour,
					minute: fromTimeMinute,
				},
				timeTwo: {
					hour: toTimeHour,
					minute: toTimeMinute,
				},
			},
		);
		const ConsultationSlotObject = new ConsultationSlotModel({
			fromTimeHour,
			fromTimeMinute,
			toTimeHour,
			toTimeMinute,
			duration,
			staffRef: staff._id,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		await ConsultationSlotObject.save();
		return resolve(ResponseUtility.SUCCESS({ message: 'New Time Slot is created.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while creating Time slot.', error: `${err}` }));
	}
});
