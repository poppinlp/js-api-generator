# js-api-generator

[![Build Status](https://travis-ci.org/poppinlp/js-api-generator.png?branch=master)](https://travis-ci.org/poppinlp/js-api-generator)
[![Dependency Status](https://david-dm.org/poppinlp/js-api-generator.svg)](https://david-dm.org/poppinlp/js-api-generator)
[![devDependency Status](https://david-dm.org/poppinlp/js-api-generator/dev-status.svg)](https://david-dm.org/poppinlp/js-api-generator#info=devDependencies)

Generate module for API requesting:

- follow CommonJS specification or ES2015
- from easy config file
- with Promise returned
- by XMLHttpRequest or fetch API (Current version use fetch API to request. Wish to use XMLHttpRequest? See [tag 0.2.4](https://github.com/poppinlp/js-api-generator/tree/v0.2.4))
- and builtin browserify and rollup

## Getting Started

Install with this command:

```shell
npm install js-api-generator --save
```

## About Generated Module

This part is for generated module.

- Each API accepts an object param which will be sent as ajax data. The `needs` api config will be checked in this param.
- Each API returns a Promise. Resolve or reject will determined by `isSuccess` api config.
- Each API won't send request again before response or timeout, but callback will be queued which will all be triggered when get response or timeout.
- The callback function accepts an object param which content is determined by `success` or `fail` api config.

### Generated Module Usage Example

#### Node env with CommonJS output

```js
var api = require('path/to/generated-api-module');

api.yourApiName({
    // data to send
}).then(res => {
    // res object content is determined by `success` config
    // do some stuff for success
}, err => {
    // err object content is determined by `fail` config
    // do some stuff for fail
});
```

#### Browser env with browserify or rollup output

```html
<script src="path/to/generated-api-module.js"></script>
<script>
api.yourApiName({
    // data to send
}).then(res => {
    // res object content is determined by `success` config
    // do some stuff for success
}, err => {
    // err object content is determined by `fail` config
    // do some stuff for fail
});
</script>
```

## About Config File

Config file should be [YAML](http://www.yaml.org/spec/1.2/spec.html) format and should have `api` and `config` object.

### api

Provide api list. Each api could have follow options:

#### url {String}

The url for requesting.

#### name {String}

The method name for this api in generated module.

#### type {String}

The request type such as `post`. Ignore upper or lower case.

#### needs {Array}

String in this array will be used as property name to check existent and not empty in request data.

#### timeout {Number}

Limit request timeout. Milliseconds.

#### mode {String}

The request mode for fetch API. Could be `cors`, `no-cors`, `same-origin`.

#### credentials {String}

The request credentials for fetch API. Could be `omit`, `same-origin`, `include`.

#### isSuccess {Object}

Use to determine success or fail for requesting.

- success: there is a same key-value pair in response object for every key-value pair in this object
- fail: any mismatch

#### success {Array}

Use to constitute a callback param when success.

#### fail {Array}

Use to constitute a callback param when fail.

### config

Provide global options. Could have follow options:

#### jquery {String}

Default: `jQuery`.

The global jquery object in your environment.

#### promise {String}

Default: `Promise`.

The global promise object in your environment.

#### type {String}

Default: `get`.

For all api. Will be covered by `api.type`.

#### mode {String}

Default: `same-origin`.

For all api. Will be covered by `api.mode`.

#### credentials {String}

Default: `same-origin`.

For all api. Will be covered by `api.credentials`.

#### isSuccess {Object}

Default: `{}`

For all api. Will be covered by `api.isSuccess`.

#### timeout {Number}

Default: `5000`.

For all api. Will be covered by `api.timeout`.

#### success {Array}

Default: `[]`

For all api. Will be extended by `api.success`.

#### fail {Array}

Default: `[]`

For all api. Will be extended by `api.fail`.

#### ignoreResponse {Boolean}

Default: `false`.

If response dose not have param which success or fail need, whether to throw an error or not.

### Config File Example

```yml
api:
-
    url: /user/create
    type: put
    name: createUser
    needs:
        - username
        - password
    success:
        - userId
-
    url: /user/isLogin
    type: get
    name: checkLogin
    success:
        - username
        - avatar
-
    url: /user/edit
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

This part is for using this package.

### Options

The follow options are used for this package, not for yaml config.

#### target {String}

Yaml config file path. Should be absolute path or relative to the file you run this command.

#### uglify {Boolean}

Default: `false`

Compress code with uglify or not.

#### uglifyOptions {Object}

Options for uglify. It's only work if `uglify` option is `true`. You can find all options [here](https://github.com/mishoo/UglifyJS2).

#### lang {String}

Default: `english`

Language for warn message. Ignore case. Welcome PR to add more. Support list:

- Chinese
- English

#### outputFile {String}

The file path to output result. Should be absolute path or relative to the file which use this package.

#### module {String}

Default: `commonjs`

The output file follows the module spec you choose. Ignore case. Welcome PR to add more. Support list:

- CommonJS
- ES2015

#### browser {Boolean|String}

Default: `false`

This option determine the output code could run in browser directly or not.
If it's not `false`, it should be a string as a module name for browser global object.

The CommonJS module will be transform with browserify and ES2015 module will be transform with rollup.
Then you could use generated module in browser like [Generated Module Usage Example](#user-content-generated-module-usage-example).

#### encoding {String}

Default: `utf8`.

File encoding for config file and output file.

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
npm test
```

## History

- Ver 1.0.2
    - Fix `TypeMismatch` error in edge
- Ver 1.0.1
    - Fix use URLSearchParams work with [fetch polyfill](https://github.com/github/fetch)
- Ver 1.0.0
    - Use [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) instead of XMLHttpRequest
    - Remove global option `jQuery`
    - Put `isSuccess` option to every api not only global
    - Remove global option `context`
    - Add global option `encoding`
    - Use `browser` option instead of `browserify` option
- Ver 0.2.4
    - Support ES2015 and CommonJS output
- Ver 0.2.0
    - Reconstruct repo
    - Support promise list instead of ignore for same request which is waiting response
- Ver 0.1.7
    - Support custom promise instead of jQuery Deferred
- Ver 0.0.3
    - Add `browserify` option
- Ver 0.0.2
    - Add `outputFile` option
- Ver 0.0.1
    - Init
