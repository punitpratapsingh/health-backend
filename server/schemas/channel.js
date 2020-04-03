/**
 * This schema represents the channel schema
 * @author punit
 * @since 19 Aug, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Channel = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	staffRef: { type: Schema.Types.ObjectId },
	activeSession: { type: Boolean, default: false },
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
});
export default database.model('Channel', Channel);
