const path = require('path');
const fs = require('fs');
const os = require('os');
const yaml = require('js-yaml');
const hogan = require('hogan.js');
const merge = require('lodash.merge');
const rollup = require('rollup');
const rollupCommonjs = require('rollup-plugin-commonjs');
const rollupNodeResolve = require('rollup-plugin-node-resolve');

const DEFAULT_CONFIG_FILE = path.join(__dirname, 'config/default.yml');
const API_TPL_FILE = path.join(__dirname, 'template/api.tpl.js');
const TMP_CODE_FILE = path.join(os.tmpdir(), `.js-api-generator.${Date.now()}.tmp.js`);
const ENCODING = 'utf8';

module.exports = async ({ config, output }) => {
	if (!config) {
		throw new Error(`Please specify config file path!`);
	}

	const configFilePath = path.isAbsolute(config)
		? config
		: path.join(path.dirname(process.mainModule.filename), config);
	const fileOptions = yaml.safeLoad(fs.readFileSync(configFilePath, ENCODING));
	const defaultOptions = yaml.safeLoad(fs.readFileSync(DEFAULT_CONFIG_FILE, ENCODING));

	const options = merge({}, defaultOptions, fileOptions);
	const apiTpl = hogan.compile(fs.readFileSync(API_TPL_FILE, ENCODING));

	const apiCode = apiTpl.render({
		apis: options.api.map(api => ({
			name: api.name,
			config: JSON.stringify(api)
		}))
	});

	console.log(options, output, TMP_CODE_FILE);

	/*
	fs.writeFileSync(TMP_CODE_FILE, apiCode);

	const bundle = await rollup.rollup({
		input: TMP_CODE_FILE,
		plugins: [
			rollupNodeResolve({
				jsnext: true,
				main: true
			}),
			rollupCommonjs({})
		]
	});

	bundle.generate({
		format: options.build.module
	});
	*/
};
