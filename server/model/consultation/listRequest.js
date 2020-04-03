import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import ConsultationRequestModel from '../../schemas/consultationRequest';

/**
 * @description service model function to handle the listing of
 * consultation request
 * @author punit
 * @since 26 august 2019
 * @param {String} id unique id of user making request.
 * @param {String} userId unique id of user to filter requests for.
 * @param {String} slotId unique id of slot to filter requests for.
 * @param {String} staffId unique id of staff to filter requests for.
 * @param {Number} status status of request to filter requests.
 * @param {Number} page for pagination page represents page number of results shown.
 * @param {Number} limit for pagination limit represents number of results per page.
 * @param {String} type type of user that is making the request.
 */
export default ({
	id,
	userId,
	slotId,
	staffId,
	status,
	limit = 30,
	page = 1,
	type,
}) => new Promise(async (resolve, reject) => {
	try {
		const matchQuery = { $match: {} };
		if (userId) {
			matchQuery.$match.requestingUser = Types.ObjectId.createFromHexString(userId);
		}
		if (slotId) {
			matchQuery.$match.slotRef = Types.ObjectId.createFromHexString(slotId);
		}
		if (staffId) {
			matchQuery.$match.requestedStaff = Types.ObjectId.createFromHexString(staffId);
		}
		if (status) {
			matchQuery.$match.status = status;
		}
		if (type === 'user') {
			matchQuery.$match.requestingUser = Types.ObjectId.createFromHexString(id);
		}
		const aggregationQuery = [
			matchQuery,
			{
				$lookup:
				{
					from: 'users',
					localField: 'requestingUser',
					foreignField: '_id',
					as: 'user',
				},
			},
			{
				$unwind:
				{
					path: '$user',
				},
			},
			{
				$lookup:
				{
					from: 'consultationslots',
					localField: 'slotRef',
					foreignField: '_id',
					as: 'slot',
				},
			},
			{
				$unwind:
				{
					path: '$slot',
				},
			},
			{
				$lookup:
				{
					from: 'users',
					localField: 'slot.staffRef',
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
				$project: {
					_id: '$_id',
					status: '$status',
					createdOn: '$createdOn',
					updatedOn: '$updatedOn',
					bookedFor: '$bookedFor',
					diseaseDescription: '$diseaseDescription',
					userDetails: {
						_id: '$user._id',
						firstName: '$user.firstName',
						lastName: '$user.lastName',
						email: '$user.email',
						phoneCode: '$user.phoneCode',
						phoneNumber: '$user.phoneNumber',
					},
					staffDetails: {
						_id: '$staff._id',
						firstName: '$staff.firstName',
						lastName: '$staff.lastName',
						email: '$staff.email',
						phoneCode: '$staff.phoneCode',
						phoneNumber: '$staff.phoneNumber',
						picture: '$staff.picture',
						address: '$staff.address',
						country: '$staff.country',
					},
				},
			},
			{
				$sort:
				{
					createdOn: -1,
				},
			},
			{
				$skip: limit * (page - 1),
			},
			{
				$limit: limit,
			},
		];
		const data = await ConsultationRequestModel.aggregate(aggregationQuery);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data, page, limit }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while listing Consultation Request.', error: `${err}` }));
	}
});
