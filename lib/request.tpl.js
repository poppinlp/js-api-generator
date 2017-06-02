const userConfig = {{{userConfig}}};
const ajaxPromise = {};

const noBodyMethod = {
	get: true,
	head: true,
	option: true
};
const typeValidator = {
	any: () => true,
	string: x => typeof x === 'string',
	number: x => typeof x === 'number',
	boolean: x => typeof x === 'boolean',
	blob: x => Object.prototype.toString.call(x) === '[object Blob]',
	array: Array.isArray,
	object: x => typeof x === 'object' && x !== null,
	null: x => x === null
};

/**
 * @param {Array|Object} needs
 * @param {Object} target
 */
const checkParam = ({needs, target}) => {
	for (let key in needs) {
		let isOptional = false;
		let value = target[key];

		if (key.charAt(key.length - 1) === '?') {
			isOptional = true;
			value = target[key.slice(0, -1)];
		}

		if (value === undefined) {
			if (isOptional) continue;
			return '{{errorMissParam}}';
		}

		const keyCondList = Array.isArray(needs[key]) ? needs[key] : [ needs[key] ];

		if (keyCondList.filter(cond => typeValidator[cond.toLowerCase()](value)).length === 0) return '{{errorTypeCheck}}';
	}

	return true;
};

/**
 * @param {Object} config.need
 * @param {Object} config.target
 */
const isSuccess = config => {
	for (const key in config.need) {
		if (!config.need.hasOwnProperty(key)) continue;
		if (config.target[key] !== config.need[key]) {
			return false;
		}
	}

	return true;
};

const getParams = (target, params) => {
	let result = {};
	let len = params.length;

	while (len--) {
		if (target[params[len]] === undefined && !userConfig.ignoreResponse) {
			return false;
		}
		result[params[len]] = target[params[len]];
	}

	return result;
};

const makeQueryString = data => {
	const body = [];
	const rbracket = /\[\]$/;

	const add = (key, val) => {
		let value = typeof val === 'function' ? val() : val;

		value = value === null || value === undefined ? '' : value;
		body[body.length] = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
	};

	const buildQuery = (prefix, obj) => {
		let name;

		if (Array.isArray(obj)) {
			obj.forEach((val, idx) => {
				rbracket.test(prefix)
					? add(prefix, v)
					: buildQuery(prefix + "[" + (typeof val === "object" && val != null ? idx : "") + "]", val);
			});
			return;
		}

		if (typeof obj === 'object') {
			for (const name in obj) {
				buildQuery(prefix + "[" + name + "]", obj[name]);
			}
			return;
		}

		add(prefix, obj);
	};

	for (const prefix in data) {
		buildQuery(prefix, data[prefix]);
	}

	return body.join('&');
};

const makeRequestData = ({method, dataType, data, headers}) => {
	if (noBodyMethod[method]) return;

	let body;

	switch (dataType) {
		case 'json':
			headers['Content-Type'] = 'application/json;charset=UTF-8';
			return JSON.stringify(data);
		case 'urlsearchparams':
			// For browser with polyfill to implement URLSearchParams which won't add this header automatically
			headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

			body = new URLSearchParams();

			for (const key in data) {
				if (!data.hasOwnProperty(key)) continue;
				body.append(key, data[key]);
			}

			// These kinds of chrome won't send anything if pass URLSearchParams object to body
			const chromeVer = Number((navigator.userAgent.match(/Chrome\/(\d{2})/) || [])[1]);
			if (chromeVer && chromeVer <= 47) return body.toString();

			return body;
		case 'formdata':
			body = new FormData();

			for (const key in data) {
				if (!data.hasOwnProperty(key)) continue;
				body.append(key, data[key]);
			}

			return body;
		case 'querystring':
			headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
			return makeQueryString(data);
	}

	return data;
};

const rejectReq = (name, err) => {
	ajaxPromise[name].forEach(item => {
		item.reject(err || '{{errorBadNetwork}}');
	});
};

const handleResponse = (json, config) => {
	const isSucc = isSuccess({
		need: config.isSuccess,
		target: json
	});
	const params = isSucc ? config.successParam : config.failParam;
	const result = getParams(json, params);

	if (result === false) {
		throw '{{errorInconsistentParam}}';
	}

	ajaxPromise[config.name].forEach(item => {
		isSucc ? item.resolve(result) : item.reject(result);
	});
};

const makeRequest = config => config.requestBy === 'fetch' ? doFetch(config) : doAjax(config);

/**
 * @param {String} config.name
 * @param {Object} config.url
 * @param {Object} config.data
 * @param {String} config.method
 * @param {String} config.cache
 * @param {String} config.mode
 * @param {Object} config.context
 * @param {Number} config.timeout
 * @param {Function} config.resolve
 * @param {Function} config.reject
 * @param {Array} config.successParam
 * @param {Array} config.failParam
 * @param {Array} config.needs
 * @param {Object} config.headers
 * @param {String} config.dataType
 */
const doFetch = config => {
	const checkRes = checkParam({
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

	const paramList = [];

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

	if (noBodyMethod[config.method]) {
		for (const key in config.data) {
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
		fetch(config.rootUrl + config.url, {
			method: config.method,
			redirect: 'follow',
			mode: config.mode,
			cache: config.cache,
			body: makeRequestData(config),
			headers: new Headers(config.headers),
			credentials: config.credentials
		}),
		new {{promise}}((resolve, reject) => {
			setTimeout(() => reject('{{errorTimeout}}'), config.timeout);
		})
	])
	.then(res => {
		if (!res.ok) throw res;
		return res.json();
	})
	.then(json => {
		handleResponse(json, config);
	})
	.catch(err => {
		rejectReq(config.name, err);
	})
	.then(() => {
		delete ajaxPromise[config.name];
	});
};

const doAjax = config => {
	const req = new XMLHttpRequest();

	req.responseType = 'json';
	req.timeout = config.timeout;
	req.withCredentials = config.credentials === 'include' ? true : false;

	req.onreadystatechange = () => {
		if (req.readyState !== XMLHttpRequest.DONE) return;

		if (req.status !== 200) {
			rejectReq(config.name, req.statusText);
			return;
		}

		handleResponse(req.response, config);
	};

	req.open(config.method, config.rootUrl + config.url, true);
	for (const name in config.headers) {
		req.setRequestHeader(name, config.headers[name]);
	}
	req.send(makeRequestData(config));
};

{{{apiList}}}
