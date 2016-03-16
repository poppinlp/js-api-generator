'use strict';

/**
 * @param {String} target - Target yml file path
 * @param {Boolean} uglify - Do uglify or not
 * @param {Object} uglifyOptions - Options for uglify
 * @param {String} lang - Language for warn message
 * @param {String} module - Module spec for output
 */
module.exports = function (options) {
    var path = require('path'),
        fs = require('fs'),
        yaml = require('js-yaml'),
        extend = require('extend'),
        uglify = require('uglify-js'),
        handlebars = require('handlebars'),
        execSync = require('child_process').execSync,
        pwd = path.dirname(process.mainModule.filename),
        encoding = {
            encoding: 'utf8'
        };

    options = extend({
        uglify: false,
        lang: 'english',
        module: 'commonjs',
        browserify: ''
    }, options);

    var inputFilePath = path.isAbsolute(options.target) ? options.target : path.join(pwd, options.target),

        tpl = handlebars.compile(fs.readFileSync(path.join(__dirname, './api.tpl.js'), encoding)),
        moduleTpl = handlebars.compile(fs.readFileSync(path.join(__dirname, './' + options.module.toLowerCase() + '.tpl.js'), encoding)),
        apiConfig = yaml.safeLoad(fs.readFileSync(inputFilePath, encoding)),

        config = extend({
            jquery: 'jQuery',
            isSuccess: {},
            ignoreResponse: false,
            context: 'window',
            timeout: 5000,
            success: [],
            fail: [],
            outputFile: '',
            promise: 'Promise'
        }, apiConfig.config);

    tpl = tpl(extend({
            apiConfig: JSON.stringify(config),
            jquery: config.jquery,
            apiList: apiConfig.api.map(function (api) {
                return moduleTpl({
                    name: api.name,
                    $: config.jquery,
                    promise: config.promise,
                    needs: JSON.stringify(api.needs || []),
                    url: api.url,
                    type: api.type || 'post',
                    context: api.context || config.context,
                    timeout: api.timeout || config.timeout,
                    successParam: JSON.stringify(config.success.concat(api.success || [])),
                    failParam: JSON.stringify(config.fail.concat(api.fail || [])),
                });
            }).join('')
        }, (function () {
            var file = options.lang,
                filePath = path.join(__dirname, '../lang', file + '.json');

            if (!fs.existsSync(filePath)) {
                throw new Error('Don\'t support language: ' + file + '. Welcome to contribute on Github repo.');
            }

            return JSON.parse(fs.readFileSync(filePath));
        })())
    );

    options.browserify && !function () {
        var tmpFile = './_.api.generator.tmp';

        fs.writeFileSync(tmpFile, tpl, encoding);
        execSync(path.join(__dirname, '../node_modules/.bin/browserify') + ' -r ' + tmpFile + ':' + options.browserify + ' > ' + tmpFile + '2');
        tpl = fs.readFileSync(tmpFile + '2', encoding);
        fs.unlinkSync(tmpFile);
        fs.unlinkSync(tmpFile + '2');
    }();

    if (options.uglify) {
        tpl = uglify.minify(tpl, extend(options.uglifyOptions, {
            fromString: true
        })).code;
    }

    if (options.outputFile) {
        fs.writeFileSync(
            path.isAbsolute(options.outputFile) ? options.outputFile : path.join(pwd, options.outputFile),
            tpl, encoding);
    } else {
        return tpl;
    }
};
