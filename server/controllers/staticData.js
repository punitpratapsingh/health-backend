import { StaticDataModel } from '../model';
import { ModelResolver } from './resolvers';

/**
 * @description This controller is responsible for staticData
 * @author punit
 * @since 27 august 2019
 */
export default {
	fetch: (req, res) => {
		const { query: { fetchFile } } = req;
		StaticDataModel.FetchData({ fetchFile })
			.then((sucess) => {
				res.set('Content-Type', 'text/html');
				res.send(sucess.data);
			})
			.catch(err => res.send(err));
	},
};
