const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;

const yaml = require('js-yaml');
const _ = require('lodash');
const hogan = require('hogan.js');
const mkpath = require('mkpath');

const REQUEST_TPL = path.join(__dirname, 'lib', 'request.tpl.js');
const API_TPL = path.join(__dirname, 'lib', 'api.tpl.js');

const DEFAULT_OPTIONS = {
	lang: 'english',
	module: 'commonjs',
	browser: false,
	encoding: 'utf8'
};
const DEFAULT_API_CONFIG = {
	rootUrl: '',
	isSuccess: {},
	ignoreResponse: false,
	timeout: 5000,
	success: [],
	fail: [],
	needs: {},
	promise: 'Promise',
	method: 'get',
	type: 'get',
	cache: 'default',
	mode: 'same-origin',
	credentials: 'same-origin',
	headers: {
		Accept: 'application/json, */*; q=0.01',
		'Accept-Charset': 'utf-8'
	},
	dataType: 'Origin'
};

const readFile = (s, u = 'utf8') => fs.readFileSync(s, u);

module.exports = options => {
	options = _.assignIn({}, DEFAULT_OPTIONS, options);

	const pwd = path.dirname(process.mainModule.filename);
	const inputFilePath = path.isAbsolute(options.target) ? options.target : path.join(pwd, options.target);

	const reqTpl = hogan.compile(readFile(REQUEST_TPL));
	const apiTpl = hogan.compile(readFile(API_TPL));

	const userConfig = yaml.safeLoad(readFile(inputFilePath, options.encoding));
	const config = _.assignIn({}, DEFAULT_API_CONFIG, userConfig.config);

	const errMsg = (() => {
		const file = options.lang.toLowerCase();
		const filePath = path.join(__dirname, 'lang', `${file}.yml`);

		if (!fs.existsSync(filePath)) {
			throw new Error(`Don't support language: ${file}. Welcome PR >.<`);
		}

		return _.assignIn({}, yaml.safeLoad(readFile(filePath)), config.errorMessage);
	})();

	let res;

	// Render html
	res = reqTpl.render(_.assignIn({}, {
		promise: config.promise,
		userConfig: JSON.stringify({
			ignoreResponse: config.ignoreResponse
		}),
		apiList: userConfig.api.map(api => {
			api = _.assignIn({}, config, api);

			return apiTpl.render({
				rootUrl: api.rootUrl,
				isCommonJS: options.module === 'commonjs',
				name: api.name,
				promise: config.promise,
				needs: JSON.stringify(api.needs),
				url: api.url,
				method: api.method || api.type,
				mode: api.mode,
				cache: api.cache,
				credentials: api.credentials,
				timeout: api.timeout,
				isSuccess: JSON.stringify(api.isSuccess),
				successParam: JSON.stringify(config.success.concat(api.success)),
				failParam: JSON.stringify(config.fail.concat(api.fail)),
				headers: JSON.stringify(api.headers),
				dataType: api.dataType.toLowerCase()
			});
		}).join('')
	}, errMsg));

	// Do browserify
	options.browser && options.browser !== 'false' && (() => {
		const TMP_FILE_PATH = './_.api.generator.tmp';

		fs.writeFileSync(TMP_FILE_PATH, res);

		({
			commonjs: () => {
				execSync(path.join(__dirname, 'node_modules/.bin/browserify') + ` -r ${TMP_FILE_PATH}:${options.browser} > ${TMP_FILE_PATH}2`);
			},
			es2015: () => {
				execSync(path.join(__dirname, 'node_modules/.bin/rollup') + ` -o ${TMP_FILE_PATH}2 -f iife -n ${options.browser} -- ${TMP_FILE_PATH}`);
			}
		})[options.module]();

		res = readFile(`${TMP_FILE_PATH}2`);
		fs.unlinkSync(TMP_FILE_PATH);
		fs.unlinkSync(`${TMP_FILE_PATH}2`);
	})();

	// Output file
	if (options.outputFile) {
		const targetPath = path.isAbsolute(options.outputFile) ? options.outputFile : path.join(pwd, options.outputFile);

		mkpath.sync(path.parse(targetPath).dir);
		fs.writeFileSync(targetPath, res, {
			encoding: options.encoding
		});
	}

	return res;
};
