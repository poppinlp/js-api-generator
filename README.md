# js-api-generator

[![Build Status][ci-img]][ci-url]
[![Dependency Status][dep-img]][dep-url]
[![Dev Dependency Status][dev-dep-img]][dev-dep-url]
[![NPM version][npm-ver-img]][npm-url]
[![NPM downloads][npm-dl-img]][npm-url]
[![NPM license][npm-lc-img]][npm-url]

Generate module for API requesting:

- follow CommonJS specification or ES2015
- from easy config file
- with Promise returned
- by XMLHttpRequest or fetch API (Current version use fetch API to request. Wish to use XMLHttpRequest? See [tag 0.2.4](https://github.com/poppinlp/js-api-generator/tree/v0.2.4))
- builtin browserify and rollup
- e.t.c

## Getting Started

Install with this command:

```shell
npm install js-api-generator --save
```

or maybe you like yarn:

```shell
yarn add js-api-generator
```

## About Generated Module

This part is for generated module.

- Each API accepts an object param which will be sent as ajax data. The `needs` api config will be checked in this param.
- Each API returns a Promise. Resolve or reject will determined by `isSuccess` api config.
- Each API won't send request again before response or timeout, but callback will be queued which will all be triggered when get response or timeout.
- The callback function accepts an object param which content is determined by `success` or `fail` api config.
- The output module is in ES2015 syntax. You should do [babel](https://babeljs.io/) or [buble](https://buble.surge.sh/) yourself if you want.

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

#### method {String}

The request method such as `post`. Ignore case.

#### type {String}

The alias for `method`. [DEPRECATED]

#### needs {Object | Array}

Default: `{}`

If this is an array, strings in it will be used as property name to check existent and not empty in request data. [DEPRECATED]

If this is an object, the key will be used as property name and the value as variable type(or type list) for data check. `Any` will be used if can't match any option. Supported variable type check list:

- String
- Number
- Boolean
- Array
- Blob
- Object
- Null
- Any

If any key is end with `?`, property name won't include the `?` and this key will be treated as optional.

#### timeout {Number}

Limit request timeout. Milliseconds.

#### mode {String}

The request mode for fetch API. Could be `cors`, `no-cors`, `same-origin`, `navigate`, `websocket`.

#### credentials {String}

The request credentials for fetch API. Could be `omit`, `same-origin`, `include`.

#### cache {String}

The request cache for fetch API. Could be `default`, `no-store`, `reload`, `no-cache`, `force-cache`, `only-if-cached`.

Since the cache option [only support in Firefox 48+](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache#Browser_compatibility),
the request url will be added a query string automatically like what jQuery ajax cache did when the cache value is `reload`, `no-cache` or `no-store`.

#### isSuccess {Object}

Use to determine success or fail for requesting.

- success: response object must has same key-value pair for every key-value pair in this object
- fail: any mismatch

#### success {Array}

Use to constitute a callback param when success.

#### fail {Array}

Use to constitute a callback param when fail.

#### headers {Object}

Use to add custom request headers. Such as `X-Requested-With`.

#### dataType {String}

Use to construct data for request body. Ignore case. `Origin` will be used if can't match any option. Supported type list:

##### URLSearchParams

Use [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) to construct passed in data.
Maybe you need [this polyfill](https://github.com/poppinlp/simple-url-search-params) for IE.

This package will set `Content-Type` to `application/x-www-form-urlencoded` for request header automatically since some browser don't support `URLSearchParams` and they won't add that header even if you use `URLSearchParams` polyfill. You could overwrite it by `headers` option.

##### FormData

Use [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) to construct passed in data.

Browser will set `Content-Type` to `multipart/form-data` for request header automatically.

##### JSON

This option will stringify passed in data to a JSON string by [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

This package will set `Content-Type` to `application/json` instead of `text/plain` for request header automatically since browser won't do that. You could overwrite it by `headers` option.

##### Origin

Won't do anything for passed in data.

### config

Provide global options. Could have follow options:

#### promise {String}

Default: `Promise`.

The global promise object in your environment.

#### type {String}

Default: `get`.

For all api. Will be covered by `api.type`.

#### cache {String}

Default: `default`.

For all api. Will be covered by `api.cache`.

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

Default: `false`

If response dose not have param which success or fail need, whether to throw an error or not.

#### errorMessage {Object}

The error message you supply will overwrite default error message by same name.

#### headers {Object}

Default: `{
	'Accept': 'application/json, */*; q=0.01',
	'Accept-Charset': 'utf-8'
}`

For all api. Will be extended by `api.headers`.

#### dataType {String}

Default: `Origin`

For all api. Will be extended by `api.dataType`.

### Config File Example

```yml
api:
-
  url: //www.123.com/test/test1
  type: put
  name: createAlgorithm
  mode: 'cors'
  needs:
    username: String
    nickname?: String
  success:
    - algorithmId
    - updateTime
-
  url: /test/test2
  type: delete
  name: checkLogin
  cache: 'no-cache'
  timeout: 10000
  needs:
    test: Boolean
  success:
    - username
    - avatar
-
  url: /test/test3
  type: post
  name: editUser
  isSuccess:
    status: true
  needs:
    username: String
    id:
		- Number
		- String
-
  url: /test/:sid/:pid
  type: get
  name: getPt
  needs:
    sid: Number
    pid?: Number
config:
  isSuccess:
    code: 0
  ignoreResponse: false
  headers: {
    Content-Type: application/x-www-form-urlencoded
  }
  fail:
    - message
```

## About This Package

This part is for using this package.

### Options

The follow options are used for this package, not for yaml config.

#### target {String}

Yaml config file path. Should be absolute path or relative to the file you run this command.

#### lang {String}

Default: `english`

Language for error message. Ignore case. Welcome PR >.<

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

## Browser Compatibility

|		| Chrome | Firefox | Edge | IE | Opera | Safari |
| ----- | ------ | ------- | ---- | -- | ----- | ------ |
| Output file | 45.0 | 22.0 | Yes | Not support | 32	| 10.0 |
| Compile with babel or buble | Yes | Yes | Yes | Depends on polyfill | Yes | Yes |

## Demo

See `./test/api.yml`.


[ci-img]:https://img.shields.io/travis/poppinlp/js-api-generator.svg?style=flat-square
[ci-url]:https://travis-ci.org/poppinlp/js-api-generator

[dep-img]:https://img.shields.io/david/poppinlp/js-api-generator.svg?style=flat-square
[dep-url]:https://david-dm.org/poppinlp/js-api-generator

[dev-dep-img]:https://img.shields.io/david/dev/poppinlp/js-api-generator.svg?style=flat-square
[dev-dep-url]:https://david-dm.org/poppinlp/js-api-generator#info=devDependencies

[npm-ver-img]:https://img.shields.io/npm/v/js-api-generator.svg?style=flat-square
[npm-dl-img]:https://img.shields.io/npm/dm/js-api-generator.svg?style=flat-square
[npm-lc-img]:https://img.shields.io/npm/l/js-api-generator.svg?style=flat-square
[npm-url]:https://www.npmjs.com/package/js-api-generator
