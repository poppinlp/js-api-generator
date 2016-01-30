var api = require('../lib/main.js');

console.log(api({
    target: './api.yml'
}));

console.log(api({
    target: './api.yml',
    uglify: true
}));

console.log(api({
    target: './api.yml',
    browserify: true
}));
