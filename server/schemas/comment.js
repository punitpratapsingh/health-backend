/**
 * This schema represents the comment schema
 * @author punit
 * @since 19 Aug, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Comment = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	postRef: { type: Schema.Types.ObjectId, required: true },
	comment: String,
	deleted: { type: Boolean, default: false },
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
});
export default database.model('Comment', Comment);
