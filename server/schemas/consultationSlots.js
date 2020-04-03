/**
 * This schema represents the consultation slots schema
 * @author punit
 * @since 19 Aug, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const ConsultationSlots = new Schema({
	staffRef: { type: Schema.Types.ObjectId, required: true },
	fromTimeHour: { type: Number, required: true },
	fromTimeMinute: { type: Number, required: true },
	toTimeHour: { type: Number, required: true },
	toTimeMinute: { type: Number, required: true },
	duration: { type: String, required: true },
	deleted: { type: Boolean, default: false },
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
});
export default database.model('ConsultationSlots', ConsultationSlots);
