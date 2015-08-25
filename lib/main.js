'use strict';

/**
 * @param {String} target - Target yml file path
 * @param {Boolean} uglify - Do uglify or not
 * @param {Object} uglifyOptions - Options for uglify
 * @param {String} lang - Language for warn message
 */
module.exports = function (options) {
    var path = require('path'),
        fs = require('fs'),
        yaml = require('js-yaml'),
        extend = require('extend'),
        uglify = require('uglify-js'),
        mustache = require('mustache'),
        execSync = require('child_process').execSync,

        pwd = path.dirname(process.mainModule.filename),
        encoding = {
            encoding: 'utf8'
        },
        inputFilePath = path.isAbsolute(options.target) ? options.target : path.join(pwd, options.target),

        tpl = fs.readFileSync(path.join(__dirname, './api.tpl.js'), encoding),
        originData = yaml.safeLoad(fs.readFileSync(inputFilePath, encoding)),
        config = {
            jquery: 'jQuery',
            isSuccess: {},
            ignoreResponse: false,
            context: 'window',
            timeout: 5000,
            success: [],
            fail: [],
            outputFile: ''
        },
        apiList = [],

        methodTlp = '\
            exports.{{name}} = function (data) {\
                if (ajaxStatus["{{name}}"]) return false;\
\
                var promise = {{$}}.Deferred(),\
                    isPass = true;\
\
                {{{checkParam}}}\
\
                if (!isPass) return promise;\
\
                doAjax({\
                    name: "{{name}}",\
                    url: "{{{url}}}",\
                    data: data || {},\
                    type: "{{type}}",\
                    context: {{context}},\
                    timeout: {{timeout}},\
                    promise: promise,\
                    successParam: {{{successParam}}},\
                    failParam: {{{failParam}}}\
                });\
\
                return promise;\
            };\
        ',
        checkParamTpl = '\
            if (checkParam({\
                need: "{{need}}",\
                target: data,\
                promise: promise\
            }) === false) {\
                isPass = false;\
            }\
        ';

    extend(config, originData.config);

    originData.api.forEach(function (api) {
        apiList.push(makeMethod(api));
    });

    tpl = mustache.render(tpl, extend({
            apiConfig: JSON.stringify(config),
            jquery: config.jquery,
            apiList: apiList.join('')
        }, loadLang(options.lang || 'english'))
    );

    if (options.browserify) {
        !function () {
            var tmpFile = './_.api.generator.tmp';

            fs.writeFileSync(tmpFile, tpl, encoding);
            execSync(path.join(__dirname, '../node_modules/.bin/browserify') + ' -r ' + tmpFile + ':' + options.browserify + ' > ' + tmpFile + '2');
            tpl = fs.readFileSync(tmpFile + '2', encoding);
            fs.unlinkSync(tmpFile);
            fs.unlinkSync(tmpFile + '2');
        }();
    }

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

    function makeMethod(api) {
        var checkParamCode = [];

        api.needs && api.needs.forEach(function (arg) {
            checkParamCode.push(mustache.render(checkParamTpl, {
                need: arg
            }));
        });

        return mustache.render(methodTlp, {
            name: api.name,
            $: config.jquery,
            checkParam: checkParamCode.join(''),
            url: api.url,
            type: api.type || 'post',
            context: api.context || config.context,
            timeout: api.timeout || config.timeout,
            successParam: JSON.stringify(config.success.concat(api.success || [])),
            failParam: JSON.stringify(config.fail.concat(api.fail || [])),
        });
    }

    function loadLang(file) {
        var filePath = path.join(__dirname, '../lang', file + '.json');

        if (!fs.existsSync(filePath)) {
            throw new Error('Don\'t support language: ' + file + '. Welcome to contribute on Github repo.');
        }

        return JSON.parse(fs.readFileSync(filePath));
    }
};
