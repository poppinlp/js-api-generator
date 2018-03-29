const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const hogan = require('hogan.js');

module.exports = ({ config, output }) => {
	if (!config) {
		throw new Error(`Please specify config file path!`);
	}

	const cwd = process.cwd();
	const configFilePath = path.isAbsolute(config) ? config : path.join(cwd, config);
	const config = yaml.safeLoad(fs.readFileSync(configFilePath));

	console.log(config);
};
