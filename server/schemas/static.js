/* eslint-disable import/named */
/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 08 October, 2019 17:58:17
*/

import { Schema } from 'mongoose';
import database from '../db';

const Static = new Schema({
	aboutUs: { type: String, default: 'about us' },
	termsAndCondition: { type: String, default: 'terms' },
	privacyPolicy: { type: String, default: 'policy' },
});
export default database.model('Static', Static);
