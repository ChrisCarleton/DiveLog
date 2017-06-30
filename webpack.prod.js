var path = require('path');
var webpack = require('webpack');

var appDir = path.resolve(__dirname, 'web/');
var outputDir = path.resolve(__dirname, 'dist/');

module.exports = {
	entry: path.resolve(appDir, 'app.js'),
	output: {
		filename: 'bundle.min.js',
		path: outputDir,
		publicPath: '/public/'
	},
	devtool: 'cheap-module-source-map',
	plugins: [
		new webpack.LoaderOptionsPlugin({
			minimize: true,
			debug: false
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: {
				filename: 'bundle.min.js.map'
			},
			beautify: false,
			mangle: {
				screw_ie8: true
			},
			compress: {
				screw_ie8: true,
				warnings: false
			},
			comments: false
		})
	],
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