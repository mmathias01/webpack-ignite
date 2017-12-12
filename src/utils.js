const path = require('path');
const {realpath, statSync, readdirSync, rmdirSync} = require('fs-extra');
const portFinder = require('portfinder');

class Utils {
    constructor(env) {
        this._env = env;
        this._config = null;
    }

    get config() {
        if (this._config) {
            return this._config;
        } else {
            throw new Error('Config was accessed before being set. Set the config before using this method.')
        }
    }

    set config(value) {
        this._config = value;
    }

    get entries() {
        if (!this._entries) {
            const rawEntries = require(this.config.runtime.appDir + '/.ignite/entries');
            this._entries = Object.assign({}, rawEntries);
            Object.keys(this._entries).forEach(key => {
                const folderPath = this._entries[key].folder ? `${this._entries[key].folder}/` : '';
                this._entries[key].folder = this._entries[key].folder || '';
                this._entries[key].inputFile = this._entries[key].inputFile ? `${this._entries[key].inputFile}` : key;
                this._entries[key].templateFile = this._entries[key].templateFile ? `${folderPath}${this._entries[key].templateFile}` : `${this._entries[key].inputFile}`;
                this._entries[key].outputFilename = this._entries[key].outputFilename ? `${folderPath}${this._entries[key].outputFilename}` : this._entries[key].inputFile;
                this._entries[key].outputTemplateFile = this._entries[key].outputTemplateFile ? `${folderPath}${this._entries[key].outputTemplateFile}` : `${this._entries[key].templateFile}`;
            });
        }
        return this._entries;
    }

    get entryFiles() {
        if (!this._entryFiles) {
            this._entryFiles = {};

            Object.keys(this.entries).forEach((entryName) => {
                this._entryFiles[entryName] = this.ifNotProduction(
                    //[
                    // require.resolve(config.runtime.appDir + '/.ignite/polyfills'),
                    //'react-hot-loader/patch',
                    path.join(this.config.runtime.appDir, this.config.source.path, `${this.entries[entryName].inputFile}.js`),
                    //],
                    //[
                    //require.resolve(config.runtime.appDir + '/.ignite/polyfills'),
                    path.join(this.config.runtime.appDir, this.config.source.path, `${this.entries[entryName].inputFile}.js`)
                    //]
                )
            })
        }
        return this._entryFiles
    }

    get appDir() {
        return realpath(process.cwd());
    }

    get devServerPort() {
        portFinder.basePort = 3000;
        return portFinder.getPortPromise();
    }

    get nodePaths() {

        return (process.env.NODE_PATH || '')
            .split(process.platform === 'win32' ? ';' : ':')
            .filter(Boolean)
            .filter(folder => !path.isAbsolute(folder))
            .map(relativePath => {
                path.resolve(this.config.runtime.appDir, relativePath)
            });
    }

    checkIf(value, trueOption = true, falseOption = false) {
        return value ? trueOption : falseOption
    }

    ifProduction(trueOption = true, falseOption = false) {
        return this.checkIf(this._env.NODE_ENV === 'production', trueOption, falseOption)
    }

    ifNotProduction(trueOption = true, falseOption = false) {
        return this.checkIf(this._env.NODE_ENV !== 'production', trueOption, falseOption)
    }

    assetFileName(type) {
        if (type) {
            return this.config.advanced.fileLoader.moduleString(type, this.ifProduction() && this.config.output.addContentHash);
        }
        return this.config.advanced.fileLoader.assetString(this.ifProduction() && this.config.output.addContentHash);
    }

    cleanEmptyFoldersRecursively(folder) {

        const isDir = statSync(folder).isDirectory();
        if (!isDir) {
            return;
        }
        let files = readdirSync(folder);
        if (files.length > 0) {
            files.forEach(function (file) {
                const fullPath = path.join(folder, file);
                this.cleanEmptyFoldersRecursively(fullPath);
            });

            files = readdirSync(folder);
        }

        if (files.length === 0) {
            rmdirSync(folder);
        }
    }
}

/**
 *
 * @type {Utils}
 */
exports.Utils = Utils