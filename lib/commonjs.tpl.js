exports.{{name}} = function (data) {
    return new {{promise}}(function (resolve, reject) {
        doAjax({
            needs: {{{needs}}},
            name: "{{name}}",
            url: "{{{url}}}",
            data: data || {},
            type: "{{type}}",
            context: {{context}},
            timeout: {{timeout}},
            resolve: resolve,
            reject: reject,
            successParam: {{{successParam}}},
            failParam: {{{failParam}}}
        });
    });
};
