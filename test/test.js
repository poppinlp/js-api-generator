var api = require('../lib/main.js');

console.log('TEST DEFAULT CONFIG...');
api({
    target: './api.yml'
});
console.log('SUCCESS!');

console.log('TEST UGLIFY...');
api({
    target: './api.yml',
    uglify: true
});
console.log('SUCCESS!');

console.log('TEST BROWSERIFY...');
api({
    target: './api.yml',
    browserify: true
});
console.log('SUCCESS!');

console.log('TEST ES2015 MODULE...');
api({
    target: './api.yml',
    module: 'es2015'
});
console.log('SUCCESS!');
