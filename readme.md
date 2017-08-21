# Webpack Ignite

#### Table of Contents

1. Environment Setup
2. Configuration
3. Start Developing
4. Production Build Directions
5. Future!

## 1. Environment Setup

Install Webpack Ignite globally (npm install -g webpack-ignite)

#### Create a new webpack projects

    * run `wpignite ignite <project_folder>` 

#### Install NPM Packages
* Run `yarn install` or `npm install` from the console in the folder that was just created.
* Edit the `package.json` to have the correct information.

## 2. Configuration

#### Config files 

Most of the configuration files are in the `.ignite` folder. The project defaults are generally pretty good but can be edited / overridden by editing  `overrides.js` and editing the values contained in that file:

```javascript
const basicConfigOverrides = {
    srcPath: 'src', //the location of the source files
    outputPath: 'build', //the output from npm run build
    contentPath: 'src', //Should almost always be the same as below. The path that content files are served from
    templatePath: 'src', //Should almost always match the above. The path that EJS templates are located in
    usejQuery: true, //Makes jQuery available to ES6 Modules for tree shaking
    usePreact: false, //Uses Preact rather than React for React compilation 
    useStandaloneVue: false, //Uses the Vue.JS standalone with the compiler
    useHashInProd: true, //Adds hashes to files in a production build for long term caching and cache busting
    minifyHTMLInProd: false, //Minifies the HTML output in a production build
    cleanBeforeBuild: true, // Removes all files from the output folder before a production build
    inlineAssetMaxSize: 20000, //File size threshold for saving assets inline in the CSS / HTML files
    hotOnlyDevServer: false, //hot only dev servers will not "auto reload" when a HMR update fails. Useful for React.
    devServerHost: "localhost", //The host the dev server should bind to.
    devServerAllowExternalAccess: false, //Allow non local browsers to connect to the dev server.
    autoOpenBrowser: true, //Open a browser once the dev server starts.
}

const advancedConfigOverrides = {
    publicUrl: '/', //Deprecated. Use publicPath.
    publicPath: '/', //The public path the site will be hosted at.
    cssRelativePath: '../', //The relative path between the CSS files and the assets folder(s). 
    fileLoaderRelativePath: '../', //The relative path to the assets folder(s) for non CSS files.
    urlLoaderExclusions: [ //These items will not get processed by the URL loader and will always use the fileLoader
         /\.html$/,
         /\.(js|jsx|vue)(\?.*)?$/,
         /\.css$/,
         /\.scss$/,
         /\.json$/,
         /\.ejs$/,
    ],
    fileLoaderFiles: [], //Additional RegEx patterns for the fileLoader
    babelFiles: [/\.(js|jsx)$/], //Array Files that should be processes by Babel. Can be an array of RegEx patterns.
    babelExcludes: [], //Array Files that should NOT processed by Babel. Can be an array of RegEx patterns.
    devSourceMapMode: 'eval', //source map mode for dev server
    externals:{}, //Object for "externals" 
    cssPreProcessingExcludes: [], //Array Files that should NOT be processed by the CSS chain. Can be an array of RegEx patterns.
    postCssOptions: { //Options for postCSS / CSS chain
         data: '@import "global";', //import a global.scss file in every .scss file. This makes it easy to use foundation
         includePaths: [ //Paths to include in scss processing to make referencing .scss files easier.
             path.join(__appDir, '..', 'src/assets/scss/'), //this is where the global.scss file should live
             path.join(__appDir, '..', 'node_modules/foundation-sites/scss') //foundation
         ]
    }
}

```
## 3. Start Developing!!

#### Setup Entry Pages / Templates
* Edit the `.ignite/entries.js` file to contain the pages you need to create. Follow the directions contained in that file.

#### Setup JS /EJS Files for each entry
* Each entry in the entties.js file will need a .js file and a .ejs file configured per the `.ignite/entries.js` to work properly.

#### Start webpack
* `npm run start`
* Webpack dev server will pick a port (starting at 3000) and launch a browser (if configured to do so).

#### Build a website!
* Use EJS, Sass, and ES6 and go to town!

## 4. Production Build Directions

For a production build run `npm run build`. The results of the build will be in the `build` folder and can be zipped and deployed to a server.

## 5. More stuff coming in the future
I have more plans for this in the future. You should be able to take advantage of any improvements to the build process by simply upgrading webpack-ignite in your project! (This will require that you don't edit the webpack.config to remove certain functionality)

* Best practice tuning for webpack output
* More concise settings
* Better build / asset copy methods
* Automated Testing
* Multiple / Configurable Templates
* React / Vue Examples

