var api = require('../main.js');

console.log('TEST DEFAULT CONFIG...');
console.log(api({
    target: './api.yml'
}));
console.log('SUCCESS!');

console.log('TEST UGLIFY...');
console.log(api({
    target: './api.yml',
    uglify: true
}));
console.log('SUCCESS!');

console.log('TEST BROWSERIFY...');
console.log(api({
    target: './api.yml',
    browser: 'myModule'
}));
console.log('SUCCESS!');

console.log('TEST ES2015 MODULE...');
console.log(api({
    target: './api.yml',
    module: 'es2015'
}));
console.log('SUCCESS!');

console.log('TEST ROLLUP...');
console.log(api({
    target: './api.yml',
    module: 'es2015',
    browser: 'myModule'
}));
console.log('SUCCESS!');
