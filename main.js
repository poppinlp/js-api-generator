const
    path = require('path'),
    fs = require('fs'),
    yaml = require('js-yaml'),
    _ = require('lodash'),
    hogan = require('hogan.js'),
    mkpath = require('mkpath'),
    execSync = require('child_process').execSync,

    REQUEST_TPL = path.join(__dirname, 'lib', 'request.tpl.js'),
    API_TPL = path.join(__dirname, 'lib', 'api.tpl.js'),

    DEFAULT_OPTIONS = {
        lang: 'english',
        module: 'commonjs',
        browser: false,
        encoding: 'utf8'
    },
    DEFAULT_API_CONFIG = {
        isSuccess: {},
        ignoreResponse: false,
        timeout: 5000,
        success: [],
        fail: [],
        needs: [],
        promise: 'Promise',
        type: 'get',
        cache: 'default',
        mode: 'same-origin',
        credentials: 'same-origin'
    };

const readFile = (s, u = 'utf8') => fs.readFileSync(s, u);

module.exports = options => {
    options = _.extend(DEFAULT_OPTIONS, options);

    var pwd = path.dirname(process.mainModule.filename),
        inputFilePath = path.isAbsolute(options.target) ? options.target : path.join(pwd, options.target),

        reqTpl = hogan.compile(readFile(REQUEST_TPL)),
        apiTpl = hogan.compile(readFile(API_TPL)),
        lang = (() => {
            var file = options.lang.toLowerCase(),
                filePath = path.join(__dirname, 'lang', `${file}.yml`);

            if (!fs.existsSync(filePath)) {
                throw new Error(`Don't support language: ${file}. Welcome PR >.<`);
            }

            return yaml.safeLoad(readFile(filePath));
        })(),

        userConfig = yaml.safeLoad(readFile(inputFilePath, options.encoding)),
        config = _.extend(DEFAULT_API_CONFIG, userConfig.config);

    reqTpl = reqTpl.render(_.extend({
        promise: config.promise,
        userConfig: JSON.stringify({
            ignoreResponse: config.ignoreResponse
        }),
        apiList: userConfig.api.map(api => (api = _.assignIn({}, config, api), apiTpl.render({
            isCommonJS: options.module === 'commonjs',
            name: api.name,
            promise: config.promise,
            needs: JSON.stringify(api.needs),
            url: api.url,
            type: api.type,
            mode: api.mode,
            cache: api.cache,
            credentials: api.credentials,
            timeout: api.timeout,
            isSuccess: JSON.stringify(api.isSuccess),
            successParam: JSON.stringify(config.success.concat(api.success)),
            failParam: JSON.stringify(config.fail.concat(api.fail)),
        }))).join('')
    }, lang));

    options.browser && options.browser !== 'false' && (() => {
        var tmpFile = './_.api.generator.tmp';

        fs.writeFileSync(tmpFile, reqTpl);

        ({
            commonjs: () => {
                execSync(path.join(__dirname, 'node_modules/.bin/browserify') + ` -r ${tmpFile}:${options.browser} > ${tmpFile}2`);
            },
            es2015: () => {
                execSync(path.join(__dirname, 'node_modules/.bin/rollup') + ` -o ${tmpFile}2 -f iife -n ${options.browser} -- ${tmpFile}`);
            }
        })[options.module]();

        reqTpl = readFile(`${tmpFile}2`);
        fs.unlinkSync(tmpFile);
        fs.unlinkSync(`${tmpFile}2`);
    })();

    if (options.outputFile) {
        let targetPath = path.isAbsolute(options.outputFile) ? options.outputFile : path.join(pwd, options.outputFile);

        mkpath.sync(path.parse(targetPath).dir);
        fs.writeFileSync(targetPath, reqTpl, {
            encoding: options.encoding
        });
    }

    return reqTpl;
};
