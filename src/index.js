const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const hogan = require('hogan.js');
const merge = require('lodash.merge');

const DEFAULT_OPTIONS_FILE = path.join(__dirname, './default-config.yml');
const API_TPL_FILE = path.join(__dirname, './api.tpl.js');
const ENCODING = 'utf8';

module.exports = ({ config, output }) => {
	if (!config) {
		throw new Error(`Please specify config file path!`);
	}

	const configFilePath = path.isAbsolute(config)
		? config
		: path.join(path.dirname(process.mainModule.filename), config);
	const fileOptions = yaml.safeLoad(fs.readFileSync(configFilePath, ENCODING));
	const defaultOptions = yaml.safeLoad(fs.readFileSync(DEFAULT_OPTIONS_FILE, ENCODING));

	const options = merge({}, defaultOptions, fileOptions);
	const apiTpl = hogan.compile(fs.readFileSync(API_TPL_FILE, ENCODING));

	console.log(options);

	const apiCode = apiTpl.render({
		withAxios: options.build.withAxios,
		apis: options.api.map(api => ({
			name: api.name,
			config: JSON.stringify(api)
		}))
	});

	console.log(apiCode);
};
