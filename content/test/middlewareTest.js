var middleware = require('../middleware'),
    assert = require('assert')
    Content = require('../model').model;

describe('Content Middleware', function () {
    describe('loadContentTypes', function () {
        it('should add conentTypes to request', function (done) {
            var contentTypes = {
                article: {
                    model: 'Article'
                }
            };
            var req = {
                bauhaus: {
                    content: {}
                }
            };
            var res = {};
            var next = function () {
                assert(req.bauhaus.content.types === contentTypes, "Request contains content types");
                done();
            };
            var loadContentTypes = middleware.loadContentTypes(contentTypes);
            loadContentTypes(req, res, next);
        });
    });
});