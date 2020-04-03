/**
 * This schema represents the channelToStaff schema
 * @author punit
 * @since 18 Sep, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const ChannelToStaff = new Schema({
	channelRef: { type: Schema.Types.ObjectId, required: true },
	staffRef: { type: Schema.Types.ObjectId, required: true },
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
});
export default database.model('ChannelToStaff', ChannelToStaff);
