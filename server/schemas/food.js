/**
 * This schema represents the food schema
 * @author punit
 * @since 2 Sep, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';
import { LECTIN_METER } from '../constants';

const Food = new Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
	level: {
		type: Number,
		min: LECTIN_METER.LOW,
		max: LECTIN_METER.HIGH,
		required: true,
	},
	lectionary: { type: String },
	recommendation: { type: String},
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
});
export default database.model('Food', Food);
