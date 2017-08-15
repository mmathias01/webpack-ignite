const basicConfigOverrides = {
    //srcPath: 'src',
    //outputPath: 'build',
    //contentPath: 'src',
    //templatePath: 'src',
    //usejQuery: true,
    //usePreact: false,
    //useStandaloneVue: false,
    //useHashInProd: true,
    //minifyHTMLInProd: false,
    //cleanBeforeBuild: true,
    //inlineAssetMaxSize: 20000,
    //hotOnlyDevServer: false,
    //devServerHost: "localhost",
    //devServerAllowExternalAccess: false,
    //autoOpenBrowser: true,
}
const advancedConfigOverrides = {
    //publicUrl: '/',
    //publicPath: '/',
    //cssRelativePath: '../',
    //fileLoaderRelativePath: '../',
    // urlLoaderExclusions: [
    //     /\.html$/,
    //     /\.(js|jsx|vue)(\?.*)?$/,
    //     /\.css$/,
    //     /\.scss$/,
    //     /\.json$/,
    //     /\.ejs$/,
    // ],
    //fileLoaderFiles: [],
    //babelFiles: [/\.(js|jsx)$/],
    //babelExcludes: [],
    //devSourceMapMode: 'eval',
    //externals:{},
    //cssPreProcessingExcludes: [],
    // postCssOptions: {
    //     data: '@import "global";',
    //     includePaths: [
    //         path.join(__appDir, '..', 'src/assets/scss/'),
    //         path.join(__appDir, '..', 'node_modules/foundation-sites/scss')
    //     ]
    // }
}
const devServerConfigOverrides = {}

module.exports = {
    basicConfigOverrides,
    advancedConfigOverrides,
    devServerConfigOverrides
}