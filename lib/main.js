'use strict';

const
    path = require('path'),
    fs = require('fs'),
    yaml = require('js-yaml'),
    _ = require('lodash'),
    uglify = require('uglify-js'),
    hogan = require('hogan.js'),
    babel = require('babel-core'),
    execSync = require('child_process').execSync,
    selfEncoding = {
        encoding: 'utf8'
    };

module.exports = options => {
    var pwd = path.dirname(process.mainModule.filename);

    options = _.extend({
        uglify: false,
        lang: 'english',
        module: 'commonjs',
        browserify: '',
        encoding: 'utf8'
    }, options);

    var inputFilePath = path.isAbsolute(options.target) ? options.target : path.join(pwd, options.target),

        tpl = hogan.compile(fs.readFileSync(path.join(__dirname, './api.tpl.js'), selfEncoding)),
        moduleTpl = hogan.compile(fs.readFileSync(path.join(__dirname, `./${options.module.toLowerCase()}.tpl.js`), selfEncoding)),
        apiConfig = yaml.safeLoad(fs.readFileSync(inputFilePath, {
            encoding: options.encoding
        })),

        config = _.extend({
            isSuccess: {},
            ignoreResponse: false,
            timeout: 5000,
            success: [],
            fail: [],
            outputFile: '',
            promise: 'Promise'
        }, apiConfig.config);

    tpl = tpl.render(_.extend({
            apiConfig: JSON.stringify({
                ignoreResponse: config.ignoreResponse
            }),
            jquery: config.jquery,
            apiList: apiConfig.api.map(api => moduleTpl.render({
                name: api.name,
                $: config.jquery,
                promise: config.promise,
                needs: JSON.stringify(api.needs || []),
                url: api.url,
                type: api.type || 'post',
                timeout: api.timeout || config.timeout,
                isSuccess: JSON.stringify(api.isSuccess || config.isSuccess),
                successParam: JSON.stringify(config.success.concat(api.success || [])),
                failParam: JSON.stringify(config.fail.concat(api.fail || [])),
            })).join('')
        }, (() => {
            var file = options.lang.toLowerCase(),
                filePath = path.join(__dirname, '../lang', `${file}.json`);

            if (!fs.existsSync(filePath)) {
                throw new Error(`Don't support language: ${file}. Welcome to contribute on Github repo.`);
            }

            return JSON.parse(fs.readFileSync(filePath));
        })())
    );

    options.browserify && !(() => {
        var tmpFile = './_.api.generator.tmp';

        fs.writeFileSync(tmpFile, tpl, selfEncoding);
        execSync(path.join(__dirname, '../node_modules/.bin/browserify') + ` -r ${tmpFile}:${options.browserify} > ${tmpFile}2`);
        tpl = fs.readFileSync(`${tmpFile}2`, selfEncoding);
        fs.unlinkSync(tmpFile);
        fs.unlinkSync(`${tmpFile}2`);
    })();

    tpl = babel.transform(tpl, {
        presets: ['latest'],
        compact: false
    }).code;

    if (options.uglify) {
        tpl = uglify.minify(tpl, _.extend(options.uglifyOptions, {
            fromString: true
        })).code;
    }

    if (options.outputFile) {
        let targetPath = path.isAbsolute(options.outputFile) ? options.outputFile : path.join(pwd, options.outputFile);
        fs.writeFileSync(targetPath, tpl, {
            encoding: options.encoding
        });
    } else {
        return tpl;
    }
};
