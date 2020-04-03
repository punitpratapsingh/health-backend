/**
 * This schema represents the consultation request schema
 * @author punit
 * @since 19 Aug, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';
import {
	CONSULTATION_REQ_STATUS,
} from '../constants';

const ConsultationRequest = new Schema({
	slotRef: { type: Schema.Types.ObjectId, required: true },
	requestingUser: { type: Schema.Types.ObjectId, required: true },
	status: {
		type: Number,
		min: CONSULTATION_REQ_STATUS.PENDING,
		max: CONSULTATION_REQ_STATUS.REJECTED,
		default: CONSULTATION_REQ_STATUS.PENDING,
	},
	bookedFor: Number,
	diseaseDescription: { type: String, required: true },
	deleted: { type: Boolean, default: false },
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
});
export default database.model('ConsultationRequest', ConsultationRequest);
