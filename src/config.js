const {merge} = require('lodash');

class Configuration {
    constructor(env, localConfig) {
        this._baseConfiguration = {
            source: {
                path: 'src',
                assetsPath: 'src',
                templatePath: 'src',
            },
            output: {
                outputPath: 'build',
                assetOutputPath: null,
                serverPath: '/',
                inlineAssetMaxSize: 20000,
                clean: true,
                addContentHash: true,
            },
            sourceMaps: {
                development: 'eval',
                production: false
            },
            devServer: {
                host: 'localhost',
                openBrowser: true,
                allowExternal: false,
                port: 3001,
                hot: 'hot',
                stats: {
                    // fallback value for stats options when an option is not defined (has precedence over local webpack defaults)
                    all: undefined,
                    // Add asset Information
                    assets: true,
                    // Sort assets by a field
                    // You can reverse the sort with `!field`.
                    assetsSort: 'field',
                    // Add information about cached (not built) modules
                    cached: true,
                    // Show cached assets (setting this to `false` only shows emitted files)
                    cachedAssets: false,
                    // Add children information
                    children: false,
                    // Add chunk information (setting this to `false` allows for a less verbose output)
                    chunks: false,
                    // Add built modules information to chunk information
                    chunkModules: false,
                    // Add the origins of chunks and chunk merging info
                    chunkOrigins: false,
                    // Sort the chunks by a field
                    // You can reverse the sort with `!field`. Default is `id`.
                    chunksSort: 'field',
                    // Context directory for request shortening
                    context: '../src/',
                    // `webpack --colors` equivalent
                    colors: true,
                    // Display the distance from the entry point for each module
                    depth: false,
                    // Display the entry points with the corresponding bundles
                    entrypoints: false,
                    // Add --env information
                    env: false,
                    // Add errors
                    errors: true,
                    // Add details to errors (like resolving log)
                    errorDetails: true,
                    // Add the hash of the compilation
                    hash: true,
                    // Set the maximum number of modules to be shown
                    maxModules: 15,
                    // Add built modules information
                    modules: false,
                    // Sort the modules by a field
                    // You can reverse the sort with `!field`. Default is `id`.
                    modulesSort: 'field',
                    // Show dependencies and origin of warnings/errors (since webpack 2.5.0)
                    moduleTrace: true,
                    // Show performance hint when file size exceeds `performance.maxAssetSize`
                    performance: true,
                    // Show the exports of the modules
                    providedExports: false,
                    // Add public path information
                    publicPath: true,
                    // Add information about the reasons why modules are included
                    reasons: true,
                    // Add the source code of modules
                    source: true,
                    // Add timing information
                    timings: true,
                    // Show which exports of a module are used
                    usedExports: false,
                    // Add webpack version information
                    version: true,
                    // Add warnings
                    warnings: true,
                }
            },
            jQuery: {
                enablejQuery: false,
            },
            react: {
                usePreact: false,
            },
            vue: {
                useStandaloneLibrary: false,
            },
            advanced: {
                aliases: {},
                externals: {},
                resolves: {},
                babel: {
                    files: [/\.(js|jsx)$/],
                    exclude: [/node_modules/],
                },
                sass: {
                    relativeAssetsPath: '',
                    includes: [],
                    excludes: [],
                    loaderOptions: {}
                },
                html: {
                    injectStylesAndScripts: true,
                    minify: false
                },
                fileLoader: {
                    relativeAssetsPath: '',
                    fileLoaderFiles: [],
                    moduleString:
                        (type, hash) => {
                            return `${type.extension}/[name]${hash ? '.[chunkhash:8]' : ''}.${type.extension}`
                        },
                    assetString:
                        (hash) => {
                            return `[path][name]${hash ? '.[hash:8]' : ''}.[ext]`
                        },
                },
                urlLoader: {
                    processImages: false,
                    imageProcessingPlugins: [],
                    exclude: [
                        /\.html$/,
                        /\.(js|jsx|vue)(\?.*)?$/,
                        /\.css$/,
                        /\.scss$/,
                        /\.json$/,
                        /\.ejs$/,
                    ],
                },
                chunkNames: {
                    manifest: 'runtime',
                    common:
                        'common',
                    vendor:
                        'vendor'
                },
                additionalCopyOperations: [
                    //{ from: 'src/assets', to: 'assets'}
                    //{ from: 'src/js/third-party', to: 'js/third-party'}
                ],
            },
            runtime: {
                env,
                babelWorkerPool: {
                    threads: 0,
                    get workers() {
                        return this.threads || 0;
                    },
                    poolTimeout: env.watch ? Infinity : 2000,
                    name: 'babelPool'
                },
                sassWorkerPool: {
                    threads: 0,
                    get workers() {
                        return this.threads || 0;
                    },
                    workerParallelJobs: 2,
                    poolTimeout: env.watch ? Infinity : 2000,
                    name: 'sassPool'
                },
            },
        }

        const _finalConfiguration = Object.assign({}, this._baseConfiguration)
        merge(_finalConfiguration, localConfig);

        if (_finalConfiguration.react.usePreact) {
            const preact_aliases = {
                'react$': 'preact-compat',
                'react-dom': 'preact-compat',
            };
            merge(_finalConfiguration.advanced.aliases, preact_aliases)
        }

        if (_finalConfiguration.jQuery.enablejQuery) {
            const jquery_aliases = {
                'jquery': 'jquery/src/jquery',
            };
            merge(_finalConfiguration.advanced.aliases, jquery_aliases)
        }

        if (_finalConfiguration.vue.useStandaloneLibrary) {
            const vue_aliases = {
                'vue$': 'vue/dist/vue.esm.js',
            }
            merge(_finalConfiguration.advanced.aliases, vue_aliases)
        }

        this._configuration = _finalConfiguration;
    }

    get configuration() {
        return this._configuration
    }
}

exports.Configuration = Configuration;