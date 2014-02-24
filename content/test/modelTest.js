var mongoose = require('mongoose');

var model  = require('../model/content'),
    assert = require('assert'),
    should = require('should');

describe('Content', function () {
    describe('schema', function () {
        it('should be a valid schema', function () {
            model.schema.should.be.an.instanceof(mongoose.Schema);
        });
    });
});