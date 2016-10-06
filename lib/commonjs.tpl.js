exports.{{name}} = function (data) {
    return new {{promise}}(function (resolve, reject) {
        doAjax({
            needs: {{{needs}}},
            name: "{{name}}",
            url: "{{{url}}}",
            data: data || {},
            type: "{{type}}",
            timeout: {{timeout}},
            resolve: resolve,
            reject: reject,
            isSuccess: {{{isSuccess}}},
            successParam: {{{successParam}}},
            failParam: {{{failParam}}}
        });
    });
};
