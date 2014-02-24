var helper = module.exports = {};


// As described by Pickels on http://stackoverflow.com/a/11713514
// Walks through a custom substack of middleware, to be called within a middleware
// which dynamically calles aditionally middleware before continuing with express / connect stact.
helper.walkSubstack = function walkSubstack (stack, req, res, next) {

    if (typeof stack === 'function') {
        stack = [stack];
    }

    var walkStack = function (i, err) {

        if (err) {
            return next(err);
        }

        if (i >= stack.length) {
            return next();
        }

        stack[i](req, res, walkStack.bind(null, i + 1));

    };
    
    walkStack(0);
};

