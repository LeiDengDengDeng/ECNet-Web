/**
 * Created by aswasn on 2016/12/15.
 */

require('webpack');

module.exports = {
    entry: {
        index: './src/controller/IndexController.js',
        new: './src/controller/NewController.js',
        logic: './src/controller/LogicController.js',
        list: './src/controller/ListController.js',
    },
    output: {
        path: __dirname+'/dist/',
        filename: '[name].js',
        publicPath: '/dist/',
    },
    module: {
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
            {test: /\.css$/, loader: 'style-loader!css-loader'},
            {
                 test: /\.(eot|svg|ttf|woff|woff2|png)\w*/,
                 loader: 'file-loader'
            },
            //{test: /\.(eot|ttf|woff|woff2|svg)$/, loader: 'file?name=fonts/[name].[ext]'},

        ],
    },
    node: {
        fs: 'empty',
    },
    externals: [
        {
            './cptable': 'var cptable',
        },
    ],
    plugins: [
        // 先不加压缩，加快刷新速度
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // })
    ],
};
