/*jslint node: true */
'use strict';

const webpack = require('webpack');
const TransferWebpackPlugin = require('transfer-webpack-plugin');
const LessPluginCleanCSS = require('less-plugin-clean-css');

module.exports = {
    context: __dirname + '/src',
    entry: './entry.jsx',
    output: {
        path: __dirname + '/build',
        publicPath: '/assets/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
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
        root: __dirname + '/src',
        extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new webpack.HotModuleReplacementPlugin(),
        new TransferWebpackPlugin([
            {from: 'root', to: ''}
        ]),
        new webpack.ProvidePlugin({
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        }),
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
