{{#isCommonJS}}exports.{{/isCommonJS}}
{{^isCommonJS}}export const {{/isCommonJS}}
{{name}} = data => new {{promise}}((resolve, reject) => doAjax({
    needs: {{{needs}}},
    name: "{{name}}",
    url: "{{{url}}}",
    data: data || {},
    type: "{{type}}",
    mode: "{{mode}}",
    cache: "{{cache}}",
    credentials: "{{credentials}}",
    timeout: {{timeout}},
    resolve: resolve,
    reject: reject,
    isSuccess: {{{isSuccess}}},
    successParam: {{{successParam}}},
    failParam: {{{failParam}}}
}));