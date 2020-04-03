import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import fs from 'fs';
import path from 'path';

/**
 * @description This service model function is for
 * getting the static data that includes
 * about us, terms and conditions and privacy policy
 * @author punit
 * @since 27 august 2019
 * @param {String} fetchFile the name of file you want to fetch.
 */

export default ({
	fetchFile,
}) => new Promise(async (resolve, reject) => {
	try {
		let filePath = path.resolve(__dirname, '../../webPages', `${fetchFile}.html`);
		if (!fs.existsSync(filePath)) {
			filePath = path.resolve(__dirname, '../../webPages', 'error.html');
		}
		const html = fs.readFileSync(filePath, { encoding: 'utf-8' });
		return resolve(ResponseUtility.SUCCESS({
			message: 'template',
			data: html,
		}));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error', error: err }));
	}
});
