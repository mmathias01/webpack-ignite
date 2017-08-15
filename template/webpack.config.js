/* eslint no-unused-vars: off */
const webpack = require('webpack');
const path = require('path');
const {
    utils: {
        getUtils
    },
    config: {
        getConfig, fileTypes
    }
} = require('webpack-ignite');

const setupConfig = (config) => {
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
    const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
    const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
    const NameAllModulesPlugin = require('name-all-modules-plugin');
    const ExtractTextPlugin = require('extract-text-webpack-plugin');
    const CleanWebpackPlugin = require('clean-webpack-plugin');
    const WebpackOnBuildPlugin = require('on-build-webpack');
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    const {
        copyContentFolder,
        assetFileName,
        getEntries,
        getBabelConfig,
        removeEmpty,
        ifNotProduction,
        ifNotDevelopment,
        ifProduction,
        ifDevelopment,
        propIf,
        nodePaths,
        entries
    } = getUtils(config);

    const _config = {
        bail: ifProduction(),
        stats: { children: false },
        devtool: ifNotProduction(config.devSourceMapMode, false),
        entry: getEntries(),
        output: {
            path: path.join(__dirname, config.outputPath),
            pathinfo: ifNotProduction(),
            filename: assetFileName(fileTypes.JAVASCRIPT),
            publicPath: config.publicPath
        },

        resolve: {
            modules: [
                path.join(__dirname, config.srcPath),
                'node_modules',
            ],
            extensions: ['.js', '.json', '.jsx', '.vue'],
            alias: config.aliases
        },
        externals: config.externals,

        module: {
            rules: removeEmpty([
                //ES Lint
                {
                    test: /\.(js|jsx|vue)$/,
                    use: ['eslint-loader'],
                    enforce: 'pre',
                    include: path.join(__dirname, config.srcPath),
                },

                //Vue.js
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        cssSourceMap: false
                    }
                },

                //URL Loader
                {
                    exclude: config.urlLoaderExclusions,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            publicPath: config.fileLoaderRelativePath,
                            context: config.srcPath,
                            limit: config.inlineAssetMaxSize,
                            name: assetFileName()
                        }
                    }]
                },

                //File Loader for excluded file(s)
                {

                    test: config.fileLoaderFiles,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            publicPath: config.fileLoaderRelativePath,
                            context: config.srcPath,
                            name: assetFileName()
                        }
                    }]
                },

                //EJS for templates
                {
                    test: /\.ejs$/,
                    loader: 'ejs-simple-loader'
                },

                // Process JS down to ES2015 with Babel
                {
                    test: config.babelFiles,
                    exclude: propIf(config.babelExcludes.length > 0, config.babelExcludes, /null_exclude/),
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            'cacheDirectory': true
                        }
                    }],
                },

                //Process CSS Files
                {
                    test: /(\.scss|\.css)$/,
                    exclude: propIf(config.cssPreProcessingExcludes.length > 0, config.cssPreProcessingExcludes, /null_exclude/),
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader', // translates CSS into CommonJS
                                options: {
                                    sourceMap: ifNotProduction(),
                                    minimize: ifProduction(),
                                    importLoaders: 2
                                }
                            },
                            'postcss-loader',
                            {
                                loader: 'sass-loader',
                                options: config.postCssOptions
                            }
                        ],
                        publicPath: config.cssRelativePath
                    })
                },

                // If you are adding a new loader remember to add the extensions to the loader exclusion list
            ])
        },

        plugins: removeEmpty([
            //Webpack HTML plugins
            ...Object.keys(entries).map((name) => {
                return new HtmlWebpackPlugin({
                    inject: true,
                    chunks: [name, config.commonChunkName, config.runtimeChunkName],
                    template: path.join(__dirname, config.templatePath, `${entries[name].inputFile}.ejs`),
                    filename: `${entries[name].outputTemplateFile}.html`,
                    minify: {
                        removeComments: ifProduction(),
                        collapseWhitespace: ifProduction() && config.minifyHTMLInProd,
                        useShortDoctype: true,
                        removeStyleLinkTypeAttributes: false,
                        keepClosingSlash: true,
                        removeEmptyAttributes: false,
                        removeRedundantAttributes: false,
                        minifyJS: false,
                        minifyCSS: false,
                        minifyURLs: false
                    }
                })
            }),

            //Make sure our paths aren't case sensitive
            new CaseSensitivePathsPlugin(),

            //Pickup new npm modules
            new WatchMissingNodeModulesPlugin(nodePaths),

            //Name Modules for caching and HMR purposes
            new webpack.NamedModulesPlugin(),

            //Also name chunks
            new webpack.NamedChunksPlugin((chunk) => {
                if (chunk.name) {
                    return chunk.name;
                }
                return chunk.mapModules(m => path.relative(m.context, m.request)).join('_');
            }),

            //Name ALL modules even async modules
            new NameAllModulesPlugin(),

            //Add environment variables to HTML
            new InterpolateHtmlPlugin(config.env.raw),

            //Give webpack access to the env variables
            new webpack.DefinePlugin(config.env.stringified),

            ifNotProduction(new webpack.HotModuleReplacementPlugin()),
            ifNotProduction(new webpack.NoEmitOnErrorsPlugin()),

            //Create a bundle with all the common chunks so it can be cached separately
            new webpack.optimize.CommonsChunkPlugin({
                name: config.commonChunkName,
                minChunks: 2,
            }),

            //Put the webpack runtime into a separate file for caching
            ifProduction(new webpack.optimize.CommonsChunkPlugin({
                name: config.runtimeChunkName,
                minChunks: Infinity,
            })),

            ifProduction(new webpack.optimize.UglifyJsPlugin({
                compress: {
                    screw_ie8: true,
                    warnings: false,
                    drop_console: true
                },
                mangle: {
                    screw_ie8: true
                },
                output: {
                    screw_ie8: true,
                    comments: false,
                    beautify: false
                }
            })),

            //extract CSS files so that they can be handled by the browser
            new ExtractTextPlugin({
                filename: (getPath) => {
                    return getPath(assetFileName(fileTypes.STYLESHEET))
                },
                disable: ifNotProduction(),
                allChunks: ifNotProduction()
            }),

            //Clean the output folder if we are running this as a production build
            ifProduction(new CleanWebpackPlugin([config.outputPath], {
                verbose: true,
                dry: !config.cleanBeforeBuild,
                watch: false,
            })),

            ifProduction(new WebpackOnBuildPlugin(function () {
                copyContentFolder();
            })),

            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: '_stats/webpack_report.html',
                defaultSizes: 'parsed',
                openAnalyzer: false,
                generateStatsFile: true,
                statsFilename: '_stats/webpack_stats.json',
                statsOptions: null,
                logLevel: 'info'
            })
        ]),

        node: {
            fs: 'empty',
            net: 'empty',
            tls: 'empty'
        },
    };

    if (ifDevelopment()) {
        _config.devServer = config.devServer
    }

    return _config;
}

module.exports = () => {
    return getConfig().then(config => setupConfig(config));
}