require('dotenv').config({ silent: true });

const path = require('path');
const { getIfUtils, removeEmpty, propIf } = require('webpack-config-utils');
const { ifNotProduction, ifNotDevelopment, ifProduction, ifDevelopment } = getIfUtils(process.env.NODE_ENV);
const { realpathSync, copySync, statSync, readdirSync, rmdirSync }  = require('fs-extra');

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
        copySync(config.contentPath, config.outputPath, {
            dereference: true,
            filter: file => {
                let isEntry = false;
                Object.keys(rawEntries).forEach((entryName) => {
                    if(new RegExp(`${config.srcPath}(?:\\/|\\\\)${rawEntries[entryName].inputFile}.js`).test(file)) {
                        isEntry = true;
                    }
                });

                return !isEntry && (file.indexOf('.ejs') || file.indexOf('.scss')) < 0
            }
        });

        config.additionalCopyOperations.forEach(operation => {
            copySync(operation.source, path.join(config.outputPath, operation.destination), {
                dereference: true
            });
        });

        cleanEmptyFoldersRecursively(config.outputPath);
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