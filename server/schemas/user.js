/**
 * This schema represents the users profile schema
 * @author punit
 * @since 19 Aug, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';
import {
	GENDER,
	USER_TYPE,
	STAFF_ACCESS_LEVEL,
} from '../constants';

const User = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String },
	phoneCode: String,
	phoneNumber: String,
	password: { type: String },
	dob: {
		day: Number,
		month: Number,
		year: Number,
	},
	gender: { type: Number, min: GENDER.MALE, max: GENDER.FEMALE },
	picture: String,
	device: String,
	speciality: String,
	type: { type: Number, min: USER_TYPE.USER, max: USER_TYPE.STAFF },
	accessLevel: Array,
	experience: String,
	description: String,
	certification: String,
	address: String,
	country: String,
	emailToken: { type: Number },
	changePassToken: { type: Number },
	changePassTokenDate: { type: Number },
	isVerified: { type: Boolean, required: true, default: false },
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
	emailTokenDate: Number,
	fcmToken: String,
	socketId: String,
	online: { type: Boolean, default: false },
	blocked: { type: Boolean, default: false },
	deleted: { type: Boolean, default: false },
});
export default database.model('User', User);
