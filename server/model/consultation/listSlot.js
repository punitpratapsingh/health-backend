import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import ConsultationSlotModel from '../../schemas/consultationSlots';
import { CONSULTATION_REQ_STATUS } from '../../constants';
/**
 * @description service model function to handle the listing
 * of slots
 * @author punit
 * @since 26 august 2019
 * @param {Number} page for pagination page represents page number of results shown.
 * @param {Number} limit for pagination limit represents number of results per page.
 */
export default ({
	id,
	type,
	staffRef,
	dateTimeStamp,
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		const matchQuery = {
			$match:
			{
				deleted: false,
			},
		};
		if ((type !== 'admin') || (type === 'admin' && staffRef)) {
			matchQuery.$match.staffRef = Types.ObjectId.createFromHexString(staffRef);
		} else {
			matchQuery.$match.staffRef = Types.ObjectId.createFromHexString(id);
		}
		const date = new Date();
		const todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
		const aggregationQuery = [
			matchQuery,
			{
				$lookup:
				{
					from: 'users',
					localField: 'staffRef',
					foreignField: '_id',
					as: 'staff',
				},
			},
			{
				$unwind:
				{
					path: '$staff',
				},
			},
			{
				$lookup: {
					from: 'consultationslotcancels',
					let: {
						slotRef: '$_id',
						timestamp: todayDate.getTime(),
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												'$slotRef',
												'$$slotRef',
											],
										},
										{
											$gte: [
												'$cancelledFor',
												'$$timestamp',
											],
										},
									],
								},
							},
						},
					],
					as: 'cancelledSlot',
				},
			},
			{
				$unwind:
				{
					path: '$cancelledSlot',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'consultationrequests',
					let: {
						slotRef: '$_id',
						timestamp: todayDate.getTime(),
						status: CONSULTATION_REQ_STATUS.REJECTED,
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												'$slotRef',
												'$$slotRef',
											],
										},
										{
											$gte: [
												'$bookedFor',
												'$$timestamp',
											],
										},
										{
											$ne: [
												'$status',
												'$$status',
											],
										},
									],
								},
							},
						},
					],
					as: 'bookedSlot',
				},
			},
			{
				$unwind:
				{
					path: '$bookedSlot',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$group: {
					_id: '$_id',
					fromTimeHour: { $first: '$fromTimeHour' },
					fromTimeMinute: { $first: '$fromTimeMinute' },
					toTimeHour: { $first: '$toTimeHour' },
					toTimeMinute: { $first: '$toTimeMinute' },
					duration: { $first: '$duration' },
					staffId: { $first: '$staff._id' },
					cancelledFor: { $push: '$cancelledSlot.cancelledFor' },
					bookedFor: { $push: '$bookedSlot.bookedFor' },
				},
			},
			{
				$project: {
					_id: '$_id',
					fromTimeHour:
					{ $cond: [{ $gt: ['$fromTimeHour', 12] }, { $subtract: ['$fromTimeHour', 12] }, '$fromTimeHour'] },
					fromTimeMinute: '$fromTimeMinute',
					fromTime: { $cond: [{ $gte: ['$fromTimeHour', 12] }, 'PM', 'AM'] },
					toTimeHour:
					{ $cond: [{ $gt: ['$toTimeHour', 12] }, { $subtract: ['$toTimeHour', 12] }, '$toTimeHour'] },
					toTimeMinute: '$toTimeMinute',
					toTime: { $cond: [{ $gte: ['$toTimeHour', 12] }, 'PM', 'AM'] },
					duration: '$duration',
					staffId: '$staffId',
					cancelledFor: '$cancelledFor',
					bookedFor: '$bookedFor',
				},
			},
			{
				$group: {
					_id: '$staffId',
					slots: {
						$push: {
							_id: '$_id',
							fromTimeHour: '$fromTimeHour',
							fromTimeMinute: '$fromTimeMinute',
							fromTime: '$fromTime',
							toTimeHour: '$toTimeHour',
							toTimeMinute: '$toTimeMinute',
							toTime: '$toTime',
							duration: '$duration',
							cancelledFor: '$cancelledFor',
							bookedFor: '$bookedFor',
						},
					},
				},
			},
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		];
		const [data] = await ConsultationSlotModel.aggregate(aggregationQuery);
		const formattedData = [];
		if (dateTimeStamp) {
			dateTimeStamp = new Date(dateTimeStamp);
			const dates = new Date(dateTimeStamp.getFullYear(), dateTimeStamp.getMonth(), dateTimeStamp.getDate(), 0, 0, 0, 0);
			const slotsPromises = [];
			const refactoredSlots = [];
			let availableSlots = data.slots.length;
			data.slots.map((element, index) => slotsPromises.push(new Promise(async (__resolve, __reject) => {
				const transientElement = Object.assign({}, element);
				try {
					let timestamp = dates.getTime();
					timestamp = parseInt(timestamp, 10);
					if (transientElement.cancelledFor.includes(timestamp)) {
						transientElement.isCancelled = true;
						availableSlots -= 1;
					} else {
						transientElement.isCancelled = false;
					}
					if (transientElement.bookedFor.includes(timestamp)) {
						transientElement.isBooked = true;
						availableSlots -= 1;
					} else {
						transientElement.isBooked = false;
					}
					refactoredSlots[index] = transientElement;
					return __resolve();
				} catch (err) {
					return __reject(err);
				}
			})));
			formattedData[formattedData.length] = {
				date: `${dates.getDate()}/${dates.getMonth() + 1}/${dates.getFullYear()}`,
				dateTimeStamp: dates.getTime(),
				availableSlots,
				slots: refactoredSlots,
			};
		} else {
			const days = [0, 1, 2, 3, 4, 5, 6];
			const slotsCalculationPromises = [days.map(day => new Promise(async (_resolve, _reject) => {
				try {
					const dates = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
					dates.setDate(todayDate.getDate() + day);
					const slotsPromises = [];
					const refactoredSlots = [];
					let availableSlots = data.slots.length;
					data.slots.map((element, index) => slotsPromises.push(new Promise(async (__resolve, __reject) => {
						const transientElement = Object.assign({}, element);
						try {
							let timestamp = dates.getTime();
							timestamp = parseInt(timestamp, 10);
							if (transientElement.cancelledFor.includes(timestamp)) {
								transientElement.isCancelled = true;
								availableSlots -= 1;
							} else {
								transientElement.isCancelled = false;
							}
							if (transientElement.bookedFor.includes(timestamp)) {
								transientElement.isBooked = true;
								availableSlots -= 1;
							} else {
								transientElement.isBooked = false;
							}
							refactoredSlots[index] = transientElement;
							return __resolve();
						} catch (err) {
							return __reject(err);
						}
					})));
					formattedData[formattedData.length] = {
						date: `${dates.getDate()}/${dates.getMonth() + 1}/${dates.getFullYear()}`,
						dateTimeStamp: dates.getTime(),
						availableSlots,
						slots: refactoredSlots,
					};
					return _resolve();
				} catch (err) {
					return _reject(err);
				}
			}))];
			await Promise.all(slotsCalculationPromises);
		}
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: formattedData, page, limit }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing Time slot.', error: `${err}` }));
	}
});
