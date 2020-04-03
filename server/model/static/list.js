/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import StaticModel from '../../schemas/static';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 09 October, 2019 09:54:28
*/
export default ({ }) => new Promise(async (resolve, reject) => {
    try {
        // write your code here.....
        const list = await StaticModel.find({ __v: 0 });
        return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: list }));
    } catch (err) {
        return reject(ResponseUtility.GENERIC_ERR({ message: 'Error', error: err.message }));
    }
});
