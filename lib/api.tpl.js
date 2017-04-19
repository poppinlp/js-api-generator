{{#isCommonJS}}exports.{{/isCommonJS}}
{{^isCommonJS}}export const {{/isCommonJS}}
{{name}} = data => new {{promise}}((resolve, reject) => doAjax({
	needs: {{{needs}}},
	name: "{{name}}",
	url: "{{{url}}}",
	data: data || {},
	method: "{{method}}",
	mode: "{{mode}}",
	cache: "{{cache}}",
	credentials: "{{credentials}}",
	timeout: {{timeout}},
	resolve: resolve,
	reject: reject,
	isSuccess: {{{isSuccess}}},
	successParam: {{{successParam}}},
	failParam: {{{failParam}}},
	headers: {{{headers}}},
	dataType: "{{dataType}}"
}));
