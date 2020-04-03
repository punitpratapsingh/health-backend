import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import ConsultationRequestModel from '../../schemas/consultationRequest';
import ConsultationSlotCancelModel from '../../schemas/consultationSlotCancel';
import ConsultationSlotsModel from '../../schemas/consultationSlots';
import UserModel from '../../schemas/user';
import NotificationModel from '../../schemas/notification';
import {
	CONSULTATION_REQ_STATUS,
	NOTIFICATION_TYPE,
	AMQP_QUEUES,
} from '../../constants';

/**
 * @description service model function to handle the action on
 * consultation request
 * @author punit
 * @since 26 august 2019
 * @param {String} requestId unique id of request.
 * @param {Number} action the action to be performed on request.
 * @param {Object} AMQPChannel the AMQP channel object for calling queue.
 */
export default ({
	id,
	staffId,
	superAdmin,
	requestId,
	action,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(requestId && action)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		if (staffId) {
			id = staffId;
		}
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No User found.' }));
		}
		if ((action < CONSULTATION_REQ_STATUS.ACCEPTED)
		|| (action > CONSULTATION_REQ_STATUS.REJECTED)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Action.' }));
		}
		const request = await ConsultationRequestModel.findOne({ _id: requestId, deleted: false });
		if (!request) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No Request found.' }));
		}
		if (!superAdmin) {
			const ownRequest = await ConsultationSlotsModel.findOne({ staffRef: staffId, _id: request.slotRef });
			if (!ownRequest) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You can only take action on your own request.' }));
			}
		}
		const slotCancelled = await ConsultationSlotCancelModel.findOne({
			slotRef: request.slotRef,
			cancelledFor: request.bookedFor,
		});
		if (slotCancelled) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'The requested slot is not available for given date.' }));
		}
		const slotBooked = await ConsultationRequestModel.findOne({
			slotRef: request.slotRef,
			bookedFor: request.bookedFor,
			status: CONSULTATION_REQ_STATUS.ACCEPTED,
		});
		if (slotBooked) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'The requested slot is already booked on requested date.' }));
		}
		await ConsultationRequestModel.findOneAndUpdate(
			{ _id: requestId, deleted: false }, { status: action },
		);
		const requestUser = await UserModel.findOne({ _id: request.requestingUser });
		// if (requestUser.fcmToken) {
		let text;
		if (action === CONSULTATION_REQ_STATUS.ACCEPTED) {
			text = 'Accepted your request';
		} else {
			text = 'Rejected your request';
		}
		const notification = new NotificationModel({
			ref: requestId,
			type: NOTIFICATION_TYPE.REQUEST,
			text,
			boldText: `${user.firstName} ${user.lastName}`,
			date: new Date(),
			timestamp: new Date(),
			userRef: id,
			notificationFor: request.requestingUser,
		});
		await notification.save();
		AMQPChannel.sendToQueue(
			AMQP_QUEUES.NOTIFICATION,
			Buffer.from(JSON.stringify({
				fcmToken: requestUser.fcmToken,
				device: requestUser.device,
				ref: requestId,
				subtitle: text,
				title: `${user.firstName} ${user.lastName}`,
				type: NOTIFICATION_TYPE.POST,
				picture: requestUser.picture,
			})),
		);
		// }
		return resolve(ResponseUtility.SUCCESS({ message: 'Consultation Request is updated.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while handling Consultation Request.', error: `${err}` }));
	}
});
