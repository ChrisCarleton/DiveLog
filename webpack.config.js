var path = require('path');

module.exports = {
	entry: path.join(__dirname, 'web/app.js'),
	output: {
		filename: 'bundle.js',
		path: path.join(__dirname, 'dist/')
	}
};
