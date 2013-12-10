var middleware = require('../middleware'),
    assert = require('assert')
    mongoConf = require('./mongoConf'),
    Page = require('../model').model;


describe('Middleware', function () {

    describe('loadPage', function () {
        it('should load page and add it to request', function (done) {

            var path = '/test';
            var page = new Page({
                route: path,
                title: 'Page'
            });
            // create new page in DB
            page.save(function () { 
                var req = { url: path };
                var res = {};
                var next = function () {
                    assert(req.bauhaus, "Defined bauhaus obj in req");
                    assert(req.bauhaus.page, "Defined page object");
                    assert(req.bauhaus.page instanceof Page, "Page object has correct type");
                    done();
                }
                middleware.loadPage(req, res, next);
            });
        })
    });


    describe('loadPageType', function () {
        it('should add pageType to request', function (done) {
            var typename = 'typename'
            var req = {
                bauhaus: {
                    page: {
                        _type: typename
                    }
                }
            };
            var res = {};
            var types = {
                'typename': {
                    foo: 'bar'
                }
            }

            var loadPageType = middleware.loadPageType(types);
            var next = function () {
                assert(req.bauhaus.pageType, "Page type is defined");
                assert(req.bauhaus.pageType === types[typename], "pageType equal to defined type")
                done();
            };
            loadPageType(req, res, next);
        });
    });


    describe('renderSlots', function () {
        it('should aggregate content to slots', function (done) {
            var req = {
                bauhaus: {
                    pageType: {
                        slots: [
                            {name: 'content'},
                            {name: 'sidebar'}
                        ]
                    }, content: {
                        data: [
                            { meta: {slot: 0, position: 0} },
                            { meta: {slot: 0, position: 1} },
                            { meta: {slot: 1, position: 0} },
                        ],
                        rendered: [
                            "content1",
                            "content2",
                            "sidebar1"
                        ]
                    }
                }
            };
            var res = {};
            var next = function () {
                assert(req.bauhaus.slots, "Req has slots");
                assert(req.bauhaus.slots.content, "Req has content slot");
                assert(req.bauhaus.slots.content == "content1content2", "Content slot html is correct");
                assert(req.bauhaus.slots.sidebar, "Req has sidebar slot");
                assert(req.bauhaus.slots.sidebar == "sidebar1", "Sidebar slot html is correct");
                done();
            };
            middleware.renderSlots(req, res, next);
        });
    });


    describe('renderPage', function () {
        it('should render page by parsing template', function (done) {
            var req = {
                bauhaus: {
                    pageType: {
                        template: __dirname + '/page.ejs'
                    },
                    slots: {
                        content: 'content1',
                        sidebar: 'sidebar1'
                    }
                }
            };
            var res = {
                render: function (template, data) {
                    assert(template === req.bauhaus.pageType.template, "Template path passed");
                    assert(data === req.bauhaus, "Rendering data passed");
                    done();
                }
            };
            var next = function () {};
            middleware.renderPage(req, res, next);
        });
    });
});
