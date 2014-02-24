var mongoose = require('mongoose');
delete mongoose.models.Page;

var mongoConf = require('./mongoConf'),
    model  = require('../model/page'),
    assert = require('assert'),
    should = require('should');

describe('Page', function () {
    describe('schema', function () {
        it('should be a valid schema', function () {
            model.schema.should.be.an.instanceof(mongoose.Schema);
        });
    });
});