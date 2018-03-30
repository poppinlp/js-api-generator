import merge from 'lodash/merge';

// Save the callbacks queue for request
const reqMap = {};

// Data type validator
const TYPE_VALIDATOR = {
	any: () => true,
	string: x => typeof x === 'string',
	number: x => typeof x === 'number',
	boolean: x => typeof x === 'boolean',
	blob: x => Object.prototype.toString.call(x) === '[object Blob]',
	array: Array.isArray,
	object: x => typeof x === 'object' && x !== null,
	null: x => x === null
};

// Error messages
const ERROR_MESSAGES = {
	missParam: 'Missing parameter',
	invalidType: 'Invalid type'
};

// Valid data types and return them
const checkType = (data, types) => {
	const ret = {};

	for (const [name, type] of Object.entries(types)) {
		const [isOptional, realname] =
			name.charAt(name.length - 1) === '?' ? [true, name.slice(0, -1)] : [false, name];
		const value = data[realname];

		if (value === undefined) {
			if (isOptional) continue;
			throw new Error(ERROR_MESSAGES.missParam);
		}
		const acTypes = Array.isArray(type) ? type : [type];

		if (acTypes.filter(type => TYPE_VALIDATOR[type](value)).length === 0) {
			throw new Error(ERROR_MESSAGES.invalidType);
		}

		ret[realname] = value;
	}

	return ret;
};

// Check if the response data meets the condition
const isSuccess = (data, cond) => {
	for (const [key, value] of Object.entries(cond)) {
		if (data[key] !== value) return false;
	}

	return true;
};

// Generate request id
const genRequestId = (name, params, body, headers) => {
	return JSON.stringify([name, params, body, headers]);
};

// Fullfill promise
const fullfilled = type => (reqId, data, xhr) =>
	reqMap[reqId].forEach(item => item[type](data, xhr));
const resolveReq = fullfilled('resolve');
const rejectReq = fullfilled('reject');

// Send request
export default ({ params, body, userConfig, fileConfig, resolve, reject }) => {
	const config = merge({}, fileConfig, userConfig);

	checkType(params, config.paramsType);
	checkType(body, config.bodyType);

	const reqId = genRequestId(config.name, params, body, config.headers);

	if (reqMap[reqId]) {
		return reqMap[reqId].push({ resolve, reject });
	}

	reqMap[reqId] = [config];

	axios(config)
		.then(xhr => {
			if (Array.isArray(xhr.data)) {
				return resolveReq(reqId, xhr.data, xhr);
			}

			isSuccess(xhr.data, config.succCond)
				? resolveReq(reqId, checkType(xhr.data, config.succRsp), xhr)
				: rejectReq(reqId, checkType(xhr.data, config.failRsp), xhr);
		})
		.catch(xhr => {
			rejectReq(reqId, xhr.data, xhr);
		})
		.then(() => {
			delete reqMap[reqId];
		});
};
