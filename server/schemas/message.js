/**
 * This schema represents the message schema
 * @author punit
 * @since 19 Aug, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Message = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	channelRef: { type: Schema.Types.ObjectId, required: true },
	deleted: { type: Boolean, default: false },
	read: { type: Boolean, default: false },
	message: String,
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
});
export default database.model('Message', Message);
