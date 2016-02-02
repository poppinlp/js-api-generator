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
            config.target[key] = {{jquery}}.trim(value);
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

/**
 * @param {String} config.name
 * @param {Object} config.url
 * @param {Object} config.data
 * @param {String} config.type
 * @param {Object} config.context
 * @param {Number} config.timeout
 * @param {Function} config.resolve
 * @param {Function} config.reject
 * @param {Array} config.successParam
 * @param {Array} config.failParam
 * @param {Array} config.needs
 */
function doAjax(config) {
    if (ajaxPromise[config.name]) {
        ajaxPromise[config.name].push({
            resolve: config.resolve,
            reject: config.reject
        });
        return;
    }

    if (!checkParam({
        needs: config.needs,
        target: config.data
    })) {
        config.reject(new Error("{{errorMissParam}}"));
        return;
    }

    ajaxPromise[config.name] = [{
        resolve: config.resolve,
        reject: config.reject
    }];

    {{jquery}}.ajax({
        cache: false,
        data: config.data,
        dataType: 'json',
        type: config.type,
        context: config.context,
        url: config.url,
        timeout: config.timeout,
        success: function (res, status, xhr) {
            var isSucc = isSuccess({
                    need: apiConfig.isSuccess,
                    target: res
                }),
                params = isSucc ? config.successParam : config.failParam,
                result = getParams(res, params);

            if (result === false) {
                throw new Error('{{errorInconsistentParam}}');
            }

            ajaxPromise[config.name].forEach(function (item) {
                isSucc ? item.resolve(result) : item.reject(result);
            });
        },
        error: function () {
            config.reject(new Error('{{errorBadNetwork}}'));
        },
        complete: function () {
            delete ajaxPromise[config.name];
        }
    });
}
{{{apiList}}}
