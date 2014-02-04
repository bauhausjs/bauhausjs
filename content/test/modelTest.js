var mongoose = require('mongoose');
delete mongoose.models.Content;

var model  = require('../model')(mongoose),
    assert = require('assert'),
    should = require('should');

describe('Content', function () {
    describe('config', function () {
        it('should have name and collection configured', function () {
            model.config.name.should.be.type('string');
            model.config.collection.should.be.type('string');
        });
    });

    describe('schema', function () {
        it('should be a valid schema', function () {
            model.schema.should.be.an.instanceof(mongoose.Schema);
        });
    });
});