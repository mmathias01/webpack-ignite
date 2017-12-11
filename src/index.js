/**
 * Webpack Ignite
 * @class webpack-ignite
 */

const {Configuration} = require('./config')
const enums = require('./enums')
const {Utils} = require('./utils')

class WebpackIgnite {
    constructor(env, localConfig = {}) {
        env.isDevServer = process.argv.find(v => v.includes('webpack-dev-server'));
        this._Utils = new Utils(env);
        this._configuration = new Configuration(env, localConfig).configuration;
        process.env.NODE_ENV = env.NODE_ENV;
    }

    get Utils() {
        return this._Utils;
    }

    get configuration() {
        return this._configuration;
    }

    get enums() {
        return enums;
    }

    ignite() {
        return Promise.all([this.Utils.devServerPort, this.Utils.appDir])
            .then(promiseValues => {
                this._configuration.devServer.port = promiseValues[0]
                this._configuration.runtime.appDir = promiseValues[1]
                this._Utils.config = this._configuration;
                return Promise.resolve(true);
            });
    }

}

exports.WebpackIgnite = WebpackIgnite;