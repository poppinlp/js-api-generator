const
    apiConfig = {{{apiConfig}}},
    ajaxPromise = {};

/**
 * @param {Array} config.needs
 * @param {Object} config.target
 */
const checkParam = config => {
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
};

/**
 * @param {Object} config.need
 * @param {Object} config.target
 */
const isSuccess = config => {
    for (var key in config.need) {
        if (!config.need.hasOwnProperty(key)) continue;
        if (config.target[key] !== config.need[key]) {
            return false;
        }
    }

    return true;
};

const getParams = (target, params) => {
    var result = {},
        len = params.length;

    while (len--) {
        if (target[params[len]] === undefined && !apiConfig.ignoreResponse) {
            return false;
        }
        result[params[len]] = target[params[len]];
    }

    return result;
};

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
const doAjax = config => {
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

    fetch(config.url, {
            method: config.type,
            cache: 'no-cache',
            redirect: 'follow',
            mode: 'cors',
            body: config.data
        })
        .then(res => res.json())
        .then(json => {
            var isSucc = isSuccess({
                    need: config.isSuccess,
                    target: json
                }),
                params = isSucc ? config.successParam : config.failParam,
                result = getParams(json, params);

            if (result === false) {
                throw new Error('{{errorInconsistentParam}}');
            }

            ajaxPromise[config.name].forEach(item => {
                isSucc ? item.resolve(result) : item.reject(result);
            });
        })
        .catch(err => {
            config.reject(new Error('{{errorBadNetwork}}'));
        })
        .then(() => {
            delete ajaxPromise[config.name];
        });
};

{{{apiList}}}
