var path = require('path');
var webpack = require('webpack');

var appDir = path.resolve(__dirname, 'web/');
var outputDir = path.resolve(__dirname, 'dist/');

module.exports = {
	entry: path.resolve(appDir, 'app.js'),
	output: {
		filename: 'bundle.js',
		path: outputDir,
		publicPath: 'http://localhost:3000/public/'
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	],
	devtool: 'cheap-module-source-map',
	devServer: {
		contentBase: outputDir,
		port: 3002,
		compress: true,
		historyApiFallback: true,
		hot: true,
		hotOnly: true,
		publicPath: 'http://localhost:3000/public/'
	},
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
