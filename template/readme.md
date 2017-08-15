# Webpack Ignite

#### Table of Contents

1. Environment Setup
2. Development Directions
3. Build Directions

## 1. Environment Setup

Open a terminal / console in the location where you checked out the code, for ease we will call this the 'project root'.

#### Remove link to existing git repository

* Mac / Linux
    * run `rm -rf .git` 
* Windows 
    * run `rmdir /s /q .git` on Windows

This deletes the existing git repository so that you start start over with a fresh repository for your project.

* run `git init` 

This will create a fresh repository that will eventually be linked up to the gyro source control system

#### Install NPM Packages

* run `yarn install` or `npm install` from the console in the root of the project

## 2. Configuration

#### Config files 

Most of the configuration files are in the `config` folder. The project defaults are generally good for prototyping or even most small websites. If you need to edit the defaults you should open `config.js` and edit the values contained in that file:

```javascript
let basicConfig = {
    srcPath: 'src',
    outputPath: 'build',
    contentPath: 'templates',
    templatePath: 'templates',
    usejQuery: false,
    usePreact: false,
    useHashInProd: false,
    cleanBeforeBuild: true,
    inlineAssetMaxSize: 10000,
}
```

The key settings in this file are:
* `src` the location of the source files.
* `outputPath` the location of the files created by `npm run build`
* `contentPath` and `templatePath` should always be the same in theory. These are the locations that HTML / EJS templates are edited and served from.
* `inlineAssetMaxSize` which determines how large files are before they do not get inlined into modules or stylesheets. 
* `usejQuery` which determines if jQuery will be made available to your ES6 modules
* `usePreact` which uses Preact rather than React for React modules _(experimental)_
* `useHashInProd` out put built files using content hashes so for long term caching / cache busting


## 3. Start Developing!!

#### Setup Entry Pages / Templates
Edit the `config/entries.js` file to contain the pages you need to create. Follow the directions contained in that file, talk to Matt with any questions about this file

#### Setup JS Files for each entry

#### Start webpack

* `npm run start`

#### Edit HTML and CSS


## 4. Production Build Directions

For a production build run `npm run build`. The results of the build will be in the `build` folder and can be zipped and sent to the client

