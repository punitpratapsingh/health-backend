/**
 * This schema represents the reply schema
 * @author punit
 * @since 19 Aug, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Reply = new Schema({
	commentRef: { type: Schema.Types.ObjectId, required: true },
	userRef: { type: Schema.Types.ObjectId, required: true },
	deleted: { type: Boolean, default: false },
	reply: String,
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
});
export default database.model('Reply', Reply);
