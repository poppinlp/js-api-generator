var apiConfig = {{{apiConfig}}},
    ajaxPromise = {};

/**
 * @param {Array} config.needs
 * @param {Object} config.target
 */
function checkParam(config) {
    var len = config.needs.length;

    while (len--) {
        var key  = config.needs[len],
            value = config.target[key];

        if (value === undefined) return false;

        if (typeof value === 'string') {
            config.target[key] = value.trim();
        }
    }

    return true;
}

/**
 * @param {Object} config.need
 * @param {Object} config.target
 */
function isSuccess(config) {
    for (var key in config.need) {
        if (!config.need.hasOwnProperty(key)) continue;
        if (config.target[key] !== config.need[key]) {
            return false;
        }
    }

    return true;
}

function getParams(target, params) {
    var result = {},
        len = params.length;

    while (len--) {
        if (target[params[len]] === undefined && !apiConfig.ignoreResponse) {
            return false;
        }
        result[params[len]] = target[params[len]];
    }

    return result;
}

function makeRequestData(type, obj) {
    if (type === 'get' || type === 'head') return;

    var p = new URLSearchParams();

    for (var key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        p.append(key, obj[key]);
    }

    return p.toString();
}

/**
 * @param {String} config.name
 * @param {Object} config.url
 * @param {Object} config.data
 * @param {String} config.type
 * @param {String} config.cache
 * @param {String} config.mode
 * @param {Object} config.context
 * @param {Number} config.timeout
 * @param {Function} config.resolve
 * @param {Function} config.reject
 * @param {Array} config.successParam
 * @param {Array} config.failParam
 * @param {Array} config.needs
 */
function doAjax(config) {
    if (!checkParam({
        needs: config.needs,
        target: config.data
    })) {
        config.reject(new Error("{{errorMissParam}}"));
        return;
    }

    if (ajaxPromise[config.name]) {
        ajaxPromise[config.name].push({
            resolve: config.resolve,
            reject: config.reject
        });
        return;
    }

    ajaxPromise[config.name] = [{
        resolve: config.resolve,
        reject: config.reject
    }];

    var paramList = [];

    if (({
        'no-store': true,
        'no-cache': true,
        reload: true
    })[config.cache]) {
        paramList.push({
            key: '_',
            value: Date.now()
        });
    }

    if (config.type === 'get') {
        for (var key in config.data) {
            if (!config.data.hasOwnProperty(key)) continue;
            paramList.push({
                key: key,
                value: config.data[key]
            });
        }
    }

    if (paramList.length) {
        config.url += '?' + paramList.map(function (item) {
            return item.key + '=' + item.value;
        }).join('&');
    }

    fetch(config.url, {
            method: config.type,
            redirect: 'follow',
            mode: config.mode,
            cache: config.cache,
            body: makeRequestData(config.type, config.data),
            headers: new Headers({
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json, text/javascript, */*; q=0.01',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }),
            credentials: config.credentials
        })
        .then(function (res) {
            if (!res.ok) throw res.statusText;
            return res.json();
        })
        .then(function (json) {
            var isSucc = isSuccess({
                    need: config.isSuccess,
                    target: json
                }),
                params = isSucc ? config.successParam : config.failParam,
                result = getParams(json, params);

            if (result === false) {
                throw '{{errorInconsistentParam}}';
            }

            ajaxPromise[config.name].forEach(function (item) {
                isSucc ? item.resolve(result) : item.reject(result);
            });
        })
        .catch(function (err) {
            ajaxPromise[config.name].forEach(function (item) {
                item.reject(new Error(err || '{{errorBadNetwork}}'));
            });
        })
        .then(function () {
            delete ajaxPromise[config.name];
        });
}

{{{apiList}}}
