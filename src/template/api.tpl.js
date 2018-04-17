{{#withAxios}}
import 'axios';
{{/withAxios}}
import sendReq from './request.js';

{{#apis}}
export const {{{name}}} = ({ params, body, config }) => new Promise((resolve, reject) => sendReq({
	params,
	body,
	userConfig: config,
	fileConfig: {{{config}}},
	resolve,
	reject
}));
{{/apis}}
