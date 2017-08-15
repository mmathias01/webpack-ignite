const getClientEnvironment = require('./env');
const path = require('path');
const { realpathSync } = require('fs-extra');
const __appDir = realpathSync(process.cwd());
const overrides = require(__appDir + '/.ignite/overrides');
const portfinder = require('portfinder');

/**
 * Basic Config Settings
 */
let basicConfig = {
    srcPath: 'src',
    outputPath: 'build',
    contentPath: 'src',
    templatePath: 'src',
    usejQuery: true,
    usePreact: false,
    useStandaloneVue: false,
    useHashInProd: true,
    minifyHTMLInProd: false,
    cleanBeforeBuild: true,
    inlineAssetMaxSize: 20000,
    hotOnlyDevServer: false,
    devServerHost: "localhost",
    devServerAllowExternalAccess: false,
    autoOpenBrowser: true,
}

/**
 * Advanced Config - only edit if you know exactly what you are doing!
 */
let advancedConfig = {
    publicUrl: '/',
    publicPath: '/',
    cssRelativePath: '../',
    fileLoaderRelativePath: '../',
    urlLoaderExclusions: [
        /\.html$/,
        /\.(js|jsx|vue)(\?.*)?$/,
        /\.css$/,
        /\.scss$/,
        /\.json$/,
        /\.ejs$/,
    ],
    fileLoaderFiles: [],
    babelFiles: [/\.(js|jsx)$/],
    babelExcludes: [],
    commonChunkName: 'common',
    runtimeChunkName: 'runtime',
    devSourceMapMode: 'eval',
    aliases: {
        '@': path.resolve('src'),
    },
    externals:{},
    cssPreProcessingExcludes: [],
    postCssOptions: {
        data: '@import "global";',
        includePaths: [
            path.join(__appDir, '..', 'src/assets/scss/'),
            path.join(__appDir, '..', 'node_modules/foundation-sites/scss')
        ]
    },
    additionalCopyOperations: [],
    moduleString: (type, hash) => {
        return `${type.extension}/[name]${hash ? '.[hash:8]' : ''}.${type.extension}`
    },
    assetString: (hash) => {
        return `[path][name]${hash ? '.[hash:8]' : ''}.[ext]`
    },
    get env() {
        return getClientEnvironment(this.publicPath)
    },
}

/**
 * Dev Server Config
 */
const devServerConfig = {
    contentBase: path.join(__appDir, basicConfig.contentPath),
    watchContentBase: true,
    host: basicConfig.devServerHost,
    disableHostCheck: basicConfig.devServerAllowExternalAccess,
    open: basicConfig.autoOpenBrowser,
    compress: false,
    overlay: {
        warnings: true,
        errors: true
    },
    stats: {children: false}
}

 /**
 * You really should never have to modify anything below this, like ever.
 */

const fileTypes = {
    JAVASCRIPT: {folder: 'js', extension: 'js'},
    STYLESHEET: {folder: 'css', extension: 'css'},
    IMAGE: {folder: 'img', extension: 'jpg'},
    PDF: {folder: 'pdf', extension: 'pdf'},
}

const getConfig = () => {

    return new Promise((resolve, reject) => {
        portfinder.basePort = 3001;
        portfinder.getPortPromise()
            .then((port) => {
                devServerConfig.port = port;
                Object.assign(basicConfig, overrides.basicConfigOverrides);
                Object.assign(advancedConfig, overrides.advancedConfigOverrides);
                Object.assign(devServerConfig, overrides.devServerConfigOverrides);

                if (basicConfig.usePreact) {
                    const preact_aliases = {
                        'react$': 'preact-compat',
                        'react-dom': 'preact-compat',
                    };
                    advancedConfig.aliases = Object.assign(advancedConfig.aliases, preact_aliases)
                }

                if (basicConfig.usejQuery) {
                    const jquery_aliases = {
                        'jquery': 'jquery/src/jquery',
                    };
                    advancedConfig.aliases = Object.assign(advancedConfig.aliases, jquery_aliases)
                }

                if (basicConfig.useStandaloneVue) {
                    const vue_aliases = {
                        'vue$': 'vue/dist/vue.esm.js',
                    }
                    advancedConfig.aliases = Object.assign(advancedConfig.aliases, vue_aliases)
                }

                if(basicConfig.hotOnlyDevServer) {
                    devServerConfig.hotOnly = true;
                } else {
                    devServerConfig.hot = true;
                }

                resolve(Object.assign({}, basicConfig, advancedConfig, {devServer: devServerConfig}))
            })
            .catch((err) => {
                reject(err);
            });
    })
}

module.exports = {
    getConfig,
    fileTypes
}