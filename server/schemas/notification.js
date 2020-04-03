/**
 * This schema represents the notifications schema
 * @author punit
 * @since 4 sep, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';
import { NOTIFICATION_TYPE } from '../constants';

const Notification = new Schema({
	ref: { type: Schema.Types.ObjectId, required: true },
	// reference to user's consultation request, post etc.
	type: {
		type: Number,
		required: true,
		min: NOTIFICATION_TYPE.REQUEST,
		max: NOTIFICATION_TYPE.POST,
	},	// @see constants.js for valid types
	text: { type: String, required: true },	// the normal text
	boldText: { type: String, default: '' },	// the highlighted text
	timestamp: Number,	// the date timestamp
	date: { type: Date, required: true },	// the moment.js format timestamp
	userRef: { type: Schema.Types.ObjectId },
	notificationFor: { type: Schema.Types.ObjectId }, // the user who will see this notification
});
export default database.model('Notification', Notification);
