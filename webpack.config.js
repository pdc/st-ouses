/*jslint node: true */
'use strict';

const webpack = require('webpack');
const TransferWebpackPlugin = require('transfer-webpack-plugin');
const LessPluginCleanCSS = require('less-plugin-clean-css');

module.exports = {
    entry: [
        'whatwg-fetch',
        __dirname + '/src/entry.jsx',
    ],
    output: {
        path: __dirname + '/build/',
        filename: 'assets/bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015'],
                    plugins: ['transform-runtime'],
                    cacheDirectory: true,
                }
            },
            {
                test: /\.css$/,
                loader: 'style!css'
            },
            {
                test: /\.less$/,
                loader: "style!css!less"
            },
        ],
    },
    lessLoader: {
        lessPlugins: [
            new LessPluginCleanCSS({advanced: true})
        ]
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new TransferWebpackPlugin([
            {from: 'src/root'}
        ]),
        /*
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
*/
    ],
    devTool: 'cheap-module-source-map',
    devServer: {
        contentBase: './build',
    }
};
