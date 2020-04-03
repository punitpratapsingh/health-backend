/**
 * This schema represents the post schema
 * @author punit
 * @since 19 Aug, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Post = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	title: String,
	content: String,
	picture: String,
	deleted: { type: Boolean, default: false },
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
});
export default database.model('Post', Post);
