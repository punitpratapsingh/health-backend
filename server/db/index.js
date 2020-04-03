
/**
 * this contains the database connection specification
 * @author punit
 */
import mongoose from 'mongoose';
import { Promise as es6Promise } from 'es6-promise';
import { mongoConnectionString } from '../constants';

const useNewUrlParser = true;
const useUnifiedTopology = false;

mongoose.Promise = es6Promise;
mongoose.connect(mongoConnectionString, { useNewUrlParser, useUnifiedTopology }, (err) => {
	if (err) {
		console.log('mongo connection err', err);
	} else {
		console.log('database connected');
	}
});
mongoose.set('useFindAndModify', false);

export default mongoose;
