import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import StaticModel from '../../schemas/static';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 08 October, 2019 18:16:35
*/
export default ({
    aboutUs,
    termsAndCondition,
    privacy,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(aboutUs || termsAndCondition || privacy )) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties.' }));
		}
		
		const StaticObject = new StaticModel({
            aboutUs,
            termsAndCondition,
            privacy
		});
        const s = await StaticObject.save();
        console.log(s);
		return resolve(ResponseUtility.SUCCESS({ message: 'Data is Saved.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error.', error: `${err}` }));
	}
});

