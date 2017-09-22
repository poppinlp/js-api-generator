const api = require('../main.js');
const { log } = console;

log('TEST DEFAULT CONFIG...');
api({
	target: './api.yml'
});
log('SUCCESS!');

log('TEST BROWSERIFY...');
api({
	target: './api.yml',
	browser: 'myModule'
});
log('SUCCESS!');

log('TEST ES2015 MODULE...');
api({
	target: './api.yml',
	module: 'es2015'
});
log('SUCCESS!');

log('TEST ROLLUP...');
api({
	target: './api.yml',
	module: 'es2015',
	browser: 'myModule',
	outputFile: './output/output.js'
});
log('SUCCESS!');
