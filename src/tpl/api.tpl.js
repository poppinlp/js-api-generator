{{#isCommonJS}}exports.{{/isCommonJS}}
{{^isCommonJS}}export const {{/isCommonJS}}
{{name}} = ({ params = {}, data = {}, config = {} }) => new Promise((resolve, reject) => makeRequest({
	baseUrl: "{{{baseUrl}}}",
	method: "{{{method}}}",
	headers: {{{headers}}},
	timeout: {{{timeout}}},
	url: "{{{url}}}",
	name: "{{{name}}}",
	params: params,
	data: data,

	resolve: resolve,
	reject: reject,
	succCond: {{{}}},
	successParam: {{{successParam}}},
	failParam: {{{failParam}}},
	dataType: "{{dataType}}"
}));
