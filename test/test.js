var api = require('../lib/main.js');

api({
    target: './api.yml'
});

api({
    target: './api.yml',
    uglify: true
});

api({
    target: './api.yml',
    browserify: true
});
