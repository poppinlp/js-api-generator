var apiConfig = {{{apiConfig}}},
    ajaxStatus = {};

/**
 * @param {String} config.need
 * @param {Object} config.target
 * @param {String} [config.value]
 * @param {Promise} config.promise
 */
function checkParam(config) {
    var value = config.target[config.need];
    value = typeof value === 'string' ? {{jquery}}.trim(value) : value;

    if ((config.value !== undefined && value !== config.value) || (config.value === undefined && !value)) {
        config.promise.reject('{{{errorMissParam}}}' + config.need);
        return false;
    }
    config.target[config.need] = value;

    return true;
}

/**
 * @param {Object} config.need
 * @param {Object} config.target
 * @param {Promise} config.promise
 */
function checkParams(config) {
    for (var key in config.need) {
        if (!config.need.hasOwnProperty(key)) continue;
        if (!checkParam({
            need: key,
            target: config.target,
            promise: config.promise,
            value: config.need[key]
        })) {
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
 * @param {Promise} config.promise
 * @param {Array} config.successParam
 * @param {Array} config.failParam
 */
function doAjax(config) {
    ajaxStatus[config.name] = true;
    {{jquery}}.ajax({
        cache: false,
        data: config.data,
        dataType: 'json',
        type: config.type,
        context: config.context,
        url: config.url,
        timeout: config.timeout,
        success: function (res, status, xhr) {
            var result, params, cb;

            if (checkParams({
                need: apiConfig.isSuccess,
                target: res,
                promise: config.promise
            })) {
                params = config.successParam;
                cb = config.promise.resolve;
            } else {
                params = config.failParam;
                cb = config.promise.reject;
            }

            result = getParams(res, params);
            if (result === false) {
                throw new Error('{{{errorInconsistentParam}}}');
            }

            cb(result);
        },
        error: function () {
            config.promise.reject('{{{errorBadNetwork}}}');
        },
        complete: function () {
            delete ajaxStatus[config.name];
        }
    });
}
{{{apiList}}}
