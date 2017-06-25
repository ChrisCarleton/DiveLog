var path = require('path');

var appDir = path.resolve(__dirname, 'web/');
var outputDir = path.resolve(__dirname, 'dist/');

module.exports = {
	entry: path.resolve(appDir, 'app.js'),
	output: {
		filename: 'bundle.js',
		path: outputDir
	},
	devtool: 'cheap-module-source-map',
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				include: appDir,
				loader: 'babel-loader',
				query: {
					presets: ['es2015', 'react']
				}
			}
		]
	}
};
