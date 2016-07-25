'use strict';

module.exports = function (aliases) {

    const BbPromise = require('bluebird'),
        path = require('path'),
        nunjucks = BbPromise.promisifyAll(require('nunjucks')),
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(path.join(__dirname, '..', 'intents')), {
                autoescape: false,
                trimBlocks: true,
                lstripBlocks: true
            }
        );

    require('./filters')(env, aliases);
    return env;

};