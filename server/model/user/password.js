/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import UserModel from '../../schemas/user';
import { HOST } from '../../constants';
/**
 * @description A service model function to handle the view part
 * of the password screen.This will contain a token field and a
 * new password screen and then allow to send request to change the
 * password along with the password token and new password.
 * @author punit
 * @since 20 august 2019
*/
export default ({
	id,
	tok,
	templatePath = path.resolve(__dirname, '../../web', 'changePassword.hbs'),
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(id && tok)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing either of the required properties.' }));
		}

		const user = await UserModel.findOne({ _id: id, changePassToken: tok });

		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Access Token.' }));
		}
		const html = fs.readFileSync(templatePath, { encoding: 'utf-8' });
		const template = handlebars.compile(html);
		const props = { user_name: id, passToken: tok, HOST };
		const compiled = template(props);
		return resolve(ResponseUtility.SUCCESS({
			message: 'template',
			data: compiled,
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error in email verification.', error: `${err}` }));
	}
});
