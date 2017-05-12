const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const webpack = require('webpack')
const HappyPack = require('happypack')
const path = require('path')

const sourcePath = path.join(__dirname, './src')
const staticsPath = path.join(__dirname, './static')

module.exports = function () {
  const nodeEnv = process.env.NODE_ENV ? 'production' : 'development'
  const isProd = nodeEnv === 'production'

  let plugins = [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(nodeEnv) }
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.ProvidePlugin({
      // $: 'jquery',
      // jQuery: 'jquery',
      // 'window.jQuery': 'jquery',
      // 'windows.jQuery': 'jquery'
    }),
    new FriendlyErrorsWebpackPlugin(),
    new ProgressBarPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      children: true,
      async: true,
      minChunks: Infinity
    }),
    new HappyPack({
      verbose: false,
      id: 'scss',
      threads: 2,
      loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
    }),
    new HappyPack({
      verbose: false,
      id: 'eslint',
      threads: 2,
      loaders: ['eslint-loader']
    }),
    new HappyPack({
      verbose: false,
      id: 'js',
      threads: 2,
      loaders: [
        {
          loader: 'ng-annotate-loader',
          options: {
            es6: true
          }
        },
        'babel-loader?cacheDirectory'
      ]
    })
  ]
  let methods = []
  if (isProd) {
    plugins = [
      ...plugins,
      ...typeof BundleAnalyzerPlugin === 'undefined' ? [] : [new BundleAnalyzerPlugin()],
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: false,
        compress: {
          sequences: true,
          properties: true,
          dead_code: true,
          drop_debugger: true,
          unsafe: false,
          conditionals: true,
          comparisons: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          hoist_funs: true,
          hoist_vars: false,
          if_return: true,
          join_vars: true,
          cascade: true,
          side_effects: true,
          warnings: false,
          drop_console: false,
          keep_fnames: true,
          global_defs: {}
        },
        output: { comments: false }
      })
    ]
  } else {
    plugins = [
      ...plugins,
      new webpack.HotModuleReplacementPlugin(),
    ]
  }
  return {
    devtool: 'source-map',
    cache: true,
    context: sourcePath,
    entry: { js: './index.js' },
    output: {
      path: staticsPath,
      publicPath: '/static/',
      filename: 'bundle.js'
    },
    module: {
      rules: [
        ...methods,
        {
          test: /\.html$/,
          use: [ {
            loader: 'html-loader',
            options: {
              minimize: true
            }
          }],
          exclude: [/node_modules/]
        },
        {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: ['happypack/loader?id=js', 'happypack/loader?id=eslint']
        },
        {
          test: /\.scss$/,
          exclude: [/node_modules/],
          use: ['happypack/loader?id=scss']
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          use: ['file-loader?name=./fonts/[name].[ext]']
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          exclude: [/node_modules/],
          use: ['url-loader?limit=10000', 'img-loader?progressive=true']
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.scss'],
      modules: [path.resolve(__dirname, 'node_modules')]
    },
    plugins,
    performance: isProd && {
      maxAssetSize: 100000,
      maxEntrypointSize: 600000,
      hints: 'warning'
    },
    stats: { colors: { green: '\u001b[32m' } },
    devServer: {
      contentBase: './',
      historyApiFallback: true,
      port: 3000,
      compress: isProd,
      inline: !isProd,
      hot: !isProd,
      stats: {
        assets: true,
        children: false,
        chunks: false,
        hash: false,
        modules: false,
        publicPath: false,
        timings: true,
        version: false,
        warnings: true,
        colors: { green: '\u001b[32m' }
      }
    }
  }
}
