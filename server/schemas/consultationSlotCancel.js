/**
 * This schema represents the consultation slots cancel schema
 * @author punit
 * @since 15 Nov, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const ConsultationSlotCancel = new Schema({
	slotRef: { type: Schema.Types.ObjectId, required: true },
	cancelledFor: Number,
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
});
export default database.model('ConsultationSlotCancel', ConsultationSlotCancel);
