# js-api-generator

[![Build Status](https://travis-ci.org/poppinlp/js-api-generator.png?branch=master)](https://travis-ci.org/poppinlp/js-api-generator)
[![Dependency Status](https://david-dm.org/poppinlp/js-api-generator.svg)](https://david-dm.org/poppinlp/js-api-generator)
[![devDependency Status](https://david-dm.org/poppinlp/js-api-generator/dev-status.svg)](https://david-dm.org/poppinlp/js-api-generator#info=devDependencies)

Generate api module:

- follow CommonJS specification
- from easy config file
- with Promise returned
- and builtin browserify

## Getting Started

Install with this command:

```shell
npm install js-api-generator --save
```

## About Generated Module

Each api will accept a object param which will be sent as ajax data. The `needs` api config will be checked in this param.

Each api will return a Promise. Resolve or reject will determined by `isSuccess` api config.

Each api won't send request again until response.

The callback function in promise will accept a object param. Its content is determined by `success` or `fail` api config.

### Generated Module Usage Example

```js
var api = require('api-module');

api.apiName({
    // data to send
}).then(function (res) {
    // res object is determined by `success` config
    // do some stuff for success
}, function (res) {
    // res object is determined by `fail` config
    // do some stuff for fail
});
```

## About Config File

Config file should be [YAML](http://www.yaml.org/spec/1.2/spec.html) format and could have `api` and `config` object.

### api

Provide api list. Each api could have these options:

#### url {String}

The url to send request.

#### name {String}

The method name for this api in generated module.

#### type {String}

Default is `post`.

The request type. Ignore upper or lower case.

#### needs {Array}

Use to check for existent and not empty when api called.

#### context {Object}

Default is `window`.

Callback function will call in this context.

#### timeout {Number}

Default is `5000`.

Limit request timeout. Milliseconds.

#### success {Array}

Use to constitute a callback param for success.

#### fail {Array}

Use to constitute a callback param for fail.

### config

Provide global options. Could have these options:

#### jquery {String}

Default is `jQuery`.

The jQuery object in your environment.

#### isSuccess {Object}

Use to determine success or fail. All of its keys in response and values equal will be determined as success.

#### context {Object}

For all api. Will be covered by `api.context`.

#### timeout {Number}

For all api. Will be covered by `api.timeout`.

#### success {Array}

For all api. Will be extended by `api.success`.

#### fail {Array}

For all api. Will be extended by `api.fail`.

#### ignoreResponse {Boolean}

If response has no param which success or fail need, whether to throw an error or not.

### Config File Example

```yml
api:
-
    url: user/create
    type: put
    name: createUser
    needs:
        - username
        - password
    success:
        - userId
-
    url: user/isLogin
    type: get
    name: checkLogin
    success:
        - username
        - avatar
-
    url: user/edit
    type: post
    name: editUser
    needs:
        - job
        - nickname
config:
    jquery: jQuery
    isSuccess:
        code: 0
    ignoreResponse: false
    fail:
        - message
```

## About This Package

### Options

#### target {String}

Yaml config file path. Should be relative to the file you run this command.

#### browserify {String}

Default: `''`

Whether to browserify generated module. If it's not empty, will do browserify and module name is the string you set.
Then you could use generated module in browser like [Generated Module Usage Example](#user-content-about-generated-module).

#### uglify {Boolean}

Default: `false`

Do uglify or not.

#### uglifyOptions {Object}

Options for uglify job. You can find all options [here](https://github.com/mishoo/UglifyJS2).

#### lang {String}

Default: `english`

Language for warn message. Support list:

- chinese
- english

#### outputFile {String}

The file path to output result. Should be relative to the file you run this command.

### Package Usage Example

```js
var api = require('js-api-generator');
var result = api({
    target: 'target yaml path',
    // other options
});
```

## Demo

```shell
node ./test/test.js
```

## History

- Ver 0.0.3 - Add `browserify`
- Ver 0.0.2 - Add `outputFile`
- Ver 0.0.1 - Init
