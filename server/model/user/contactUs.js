import {
	ResponseUtility,
	EmailServices,
} from 'appknit-backend-bundle';
import { CONTACT_US_EMAIL } from '../../constants';

/**
 * @description service model function to handle the contact us
 * @author punit
 * @since 1 augast, 2019
 * @param {String} name the name of the user.
 * @param {String} email the email of the user.
 * @param {String} description user's query or feedback.
 */
export default ({
	name,
	email,
	description,
}) => new Promise(async (resolve, reject) => {
	try {
		await EmailServices({
			to: CONTACT_US_EMAIL, text: `Feedback: ${description}\nUser Details:-\nName: ${name},\nEmail: ${email}`, subject: 'Wellness App user feedback',
		});
		return resolve(ResponseUtility.SUCCESS({ message: 'Submitted Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while creating user.', error: `${err}` }));
	}
});
