/**
 * This schema represents the Symptoms schema
 * @author punit
 * @since 3 Sep, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Symptom = new Schema({
	name: { type: String, required: true },
	overview: { type: String, required: true },
	potentialDiseases: { type: Array, required: true },
	recommendation: { type: String, required: true },
	picture: String,
	coverPicture: String,
	createdOn: { type: Number, default: new Date() },
	updatedOn: { type: Number, default: new Date() },
});
export default database.model('Symptom', Symptom);
