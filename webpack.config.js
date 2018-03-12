var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: "./src/main.js",
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public')
	},
	module: {
		rules: [
			{
        			test: /\.css$/,
        			use: ['style-loader', 'css-loader']
      			},
			{
				test: /\.js$/,
				loader: 'ify-loader'
			}
    		]
	}
};
