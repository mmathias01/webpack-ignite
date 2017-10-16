require('dotenv').config({ silent: true });

const path = require('path');
const { getIfUtils, removeEmpty, propIf } = require('webpack-config-utils');
const { ifNotProduction, ifNotDevelopment, ifProduction, ifDevelopment } = getIfUtils(process.env.NODE_ENV);
const { realpathSync, copySync, statSync, readdirSync, rmdirSync }  = require('fs-extra');
const ora = require('ora');
const prettyBytes = require('pretty-bytes');
const globby = require('globby');

const imagemin = require('imagemin');
const gifSicle = require('imagemin-gifsicle');
const mozJpeg = require('imagemin-mozjpeg');
const optiPng = require('imagemin-optipng');
const svgO = require('imagemin-svgo');


const getUtils = (config) => {

    const appDirectory = realpathSync(process.cwd());

    const rawEntries = require(appDirectory + '/.ignite/entries');

    const entries = (() => {
        let _entries = Object.assign({}, rawEntries);
        Object.keys(_entries).forEach(key => {
            _entries[key].inputFile = _entries[key].inputFile || key;
            _entries[key].outputFilename = _entries[key].outputFilename || _entries[key].inputFile;
            _entries[key].outputTemplateFile = _entries[key].outputTemplateFile || _entries[key].outputFilename;
        });
        return _entries;
    })();

    const resolveApp = (relativePath) => {
        return path.resolve(appDirectory, relativePath);
    };

    const copyContentFolder = () => {
        const spinner = ora(`Copying Assets from ${config.contentPath} to ${config.assetOutputPath || config.outputPath}`).start();

        copySync(config.contentPath, config.assetOutputPath || config.outputPath, {
            dereference: true,
            filter: file => {
                let isEntry = false;

                Object.keys(rawEntries).forEach((entryName) => {
                    if (new RegExp(`${config.srcPath}(?:\\/|\\\\)${rawEntries[entryName].inputFile}.js`).test(file)) {
                        isEntry = true;
                    }
                });

                return !isEntry && !/\.(ejs|vue|scss|jsx)/.test(file) && !/\.(jpe?g|png|gif|svg)$/i.test(file)
            }
        });
        spinner.succeed()
        spinner.start(`Performing Additional Copy Operations`);

        config.additionalCopyOperations.forEach(operation => {
            copySync(operation.source, path.join(config.outputPath, operation.destination), {
                dereference: true
            });
        });

        spinner.succeed()
        spinner.start(`Minifying Images`);

        minifyImages()
            .then((processedFiles) => {
                const totals = {
                    before: 0,
                    after: 0
                }

                Object.keys(processedFiles).forEach((file)=>{
                    totals.before += processedFiles[file].before
                    totals.after += processedFiles[file].after
                });

                spinner.succeed(`${getStats(totals.before, totals.after).message}`);
                spinner.start(`Cleaning Up Empty Folders`);
                cleanEmptyFoldersRecursively(config.outputPath);
                spinner.succeed();
            });

    };

    const minifyImages = () => {

        const processedFiles = {};
        const imageProcessingPlugins = [
            gifSicle(),
            //pngQuant(),
            mozJpeg(),
            optiPng(),
            svgO()
        ];

        const allFolders = globby.sync(`${config.contentPath}/**/`);

        const allFoldersPromises = allFolders.map(folder => {
            return imagemin([`${folder}/*.{jpg,jpeg,png,gif,svg,ico}`], folder.replace(`${config.contentPath}`, `${config.outputPath}`), {plugins: imageProcessingPlugins})
                .then(files => {
                    return files.map(file => {
                        const statsObject = {
                            outputPath: file.path,
                            before: getFilesizeInBytes(file.path.replace(`${config.outputPath}`, `${config.contentPath}`)),
                            after: getFilesizeInBytes(file.path)
                        };
                        processedFiles[file.path] = statsObject;
                        return JSON.stringify(statsObject);
                    });
                });
        })

        return Promise.all(allFoldersPromises).then(()=>{return processedFiles});
    }

    const getFilesizeInBytes = (filename) => {
        return statSync(filename).size
    }

    const getStats = (max, min) => {
        const difference = Math.abs(max - min);
        const percent = (difference / max) * 100;
        const msg = `saved ${prettyBytes(difference)} - ${percent.toFixed(1).replace(/\.0$/, '')}%`;

        return {
            difference,
            percent,
            max: max,
            min: min,
            message: msg
        };
    };

    const cleanEmptyFoldersRecursively = (folder) => {

        const isDir = statSync(folder).isDirectory();
        if (!isDir) {
            return;
        }
        let files = readdirSync(folder);
        if (files.length > 0) {
            files.forEach(function(file) {
                const fullPath = path.join(folder, file);
                cleanEmptyFoldersRecursively(fullPath);
            });

            files = readdirSync(folder);
        }

        if (files.length === 0) {
            rmdirSync(folder);
        }
    };

    const assetFileName = (type) => {
        if (type) {
            return config.moduleString(type, ifProduction() && config.useHashInProd);
        }
        return config.assetString(ifProduction() && config.useHashInProd);
    };

    const getEntries = () => {
        let _entries = {};

        Object.keys(entries).forEach((entryName) => {
            _entries[entryName] = ifNotProduction(
                [
                    require.resolve(appDirectory + '/.ignite/polyfills'),
                    'react-hot-loader/patch',
                    path.join(appDirectory, config.srcPath, `${entries[entryName].inputFile}.js`),
                ],
                [
                    require.resolve(appDirectory + '/.ignite/polyfills'),
                    path.join(appDirectory, config.srcPath, `${entries[entryName].inputFile}.js`),
                ]
            )
        });
        return _entries;
    }

    const nodePaths = (process.env.NODE_PATH || '')
        .split(process.platform === 'win32' ? ';' : ':')
        .filter(Boolean)
        .filter(folder => !path.isAbsolute(folder))
        .map(resolveApp);

    return {
        copyContentFolder,
        assetFileName,
        getEntries,
        entries,
        getIfUtils,
        removeEmpty,
        ifNotProduction,
        ifNotDevelopment,
        ifProduction,
        ifDevelopment,
        propIf,
        nodePaths
    }
}

module.exports =  {
    getUtils
}