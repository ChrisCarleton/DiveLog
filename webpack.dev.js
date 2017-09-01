var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var extractStyles = new ExtractTextPlugin({
	filename: 'bundle.css'
});

var path = require('path');
var webpack = require('webpack');

var appDir = path.resolve(__dirname, 'web/');
var outputDir = path.resolve(__dirname, 'dist/');

var copyImages = new CopyWebpackPlugin([{
	from: path.resolve(appDir, 'img/'),
	to: path.resolve(outputDir, 'img/')
}]);

module.exports = {
	entry: path.resolve(appDir, 'app.js'),
	output: {
		filename: 'bundle.js',
		path: outputDir,
		publicPath: 'http://localhost:3000/public/'
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		extractStyles,
		copyImages
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
		rules: [
			{
				test: /\.jsx?$/,
				include: appDir,
				use: [
					{
						loader: 'babel-loader',
						query: {
							presets: ['es2015', 'react']
						}
					}
				]
			},
			{
				test: /(\.less|\.css)$/,
				include: appDir,
				use: extractStyles.extract({
					use: [
						{
							loader: 'css-loader'
						},
						{
							loader: 'less-loader'
						}
					]
				})
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/,
				loader: 'file-loader',
				query: {
					name: 'fonts/[name].[ext]'
				}
			}
		]
	}
};
