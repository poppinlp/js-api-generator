var userConfig = {{{userConfig}}},
    ajaxPromise = {};

const typeValidator = {
    any: () => true,
    string: x => typeof x === 'string',
    number: x => typeof x === 'number',
    boolean: x => typeof x === 'boolean',
    array: Array.isArray,
    object: x => typeof x === 'object' && x !== null,
    null: x => x === null
};

/**
 * @param {Array|Object} config.needs
 * @param {Object} config.target
 */
const checkParam = config => {
    var condMap = {};

    if (Array.isArray(config.needs)) {
        config.needs.forEach(key => condMap[key] = 'Any');
    } else {
        condMap = config.needs;
    }

    for (let key in condMap) {
        let value = config.target[key];
        if (value === undefined) return '{{errorMissParam}}';

        let condList = Array.isArray(condMap[key]) ? condMap[key] : [ condMap[key] ],
            len = condList.length;

        while (len--) {
            if (!typeValidator[condList[len].toLowerCase()](value)) return '{{errorTypeCheck}}';
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
        if (target[params[len]] === undefined && !userConfig.ignoreResponse) {
            return false;
        }
        result[params[len]] = target[params[len]];
    }

    return result;
};

const makeRequestData = (type, obj) => {
    if (type === 'get' || type === 'head') return;

    var p = new URLSearchParams();

    for (var key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        p.append(key, obj[key]);
    }

    return p.toString();
};

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
const doAjax = config => {
    var checkRes = checkParam({
        needs: config.needs,
        target: config.data
    });
    if (checkRes !== true) {
        config.reject(new Error(checkRes));
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

    config.url = config.url
        .split('/')
        .map(urlPart => {
            let partName = urlPart.slice(1);
            return config.data[partName] || urlPart;
        })
        .join('/');

    if (paramList.length) {
        config.url += '?' + paramList.map(item => `${item.key}=${item.value}`).join('&');
    }

    {{promise}}.race([
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
        }),
        new {{promise}}((resolve, reject) => {
            setTimeout(() => reject('{{errorTimeout}}'), config.timeout);
        })
    ])
    .then(res => {
        if (!res.ok) throw res.statusText;
        return res.json();
    })
    .then(json => {
        var isSucc = isSuccess({
                need: config.isSuccess,
                target: json
            }),
            params = isSucc ? config.successParam : config.failParam,
            result = getParams(json, params);

        if (result === false) {
            throw '{{errorInconsistentParam}}';
        }

        ajaxPromise[config.name].forEach(item => {
            isSucc ? item.resolve(result) : item.reject(result);
        });
    })
    .catch(err => {
        ajaxPromise[config.name].forEach(item => {
            item.reject(new Error(err || '{{errorBadNetwork}}'));
        });
    })
    .then(() => {
        delete ajaxPromise[config.name];
    });
};

{{{apiList}}}
