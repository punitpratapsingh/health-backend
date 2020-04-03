/* eslint-disable global-require */
/**
* This is the indexer for services
* @author punit
* @since 7 august, 2019
*/
import fs from 'fs';

const skip = ['index.js'];
const files = fs.readdirSync(__dirname);

// eslint-disable-next-line array-callback-return
files.map((file) => {
	const found = skip.find(skipThisFile => skipThisFile === file);
	if (!found) {
		const fileName = `${file.charAt(0).toUpperCase()}${file.split('.')[0].substring(1, file.length)}`;
		// eslint-disable-next-line import/no-dynamic-require
		if (!fileName.startsWith('.')) { module.exports[`${fileName}Service`] = require(`./${file}`).default; }
	}
});
