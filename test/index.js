/*jshint expr: true*/

var chai = require('chai'),
    expect = chai.expect,
    ModelMe = require('../index'),
    assert = require('assert');

describe('ModelMe', function() {

  it ('decorates the class', function() {

    function Thing(data) { }

    ModelMe(Thing);

    ['attributes', 'schema'].forEach(function(method) {
      expect(Thing).to.have.property(method);
    });

    ['attr', 'validate', 'getMessage'].forEach(function(method) {
      expect(Thing).itself.to.respondTo(method);
    });
  });

  it('decorates the prototype', function() {
    function Thing(data) {}

    ModelMe(Thing);

    var tester = new Thing();

    ['attributes', 'errors'].forEach(function(method) {
      expect(tester).to.have.property(method);
    });

    ['validate', 'toJSON'].forEach(function(method) {
      expect(Thing).to.respondTo(method);
    });
  });

  describe('.attr', function() {
    it('adds to the attribute list', function() {
      function Thing() {}
      ModelMe(Thing)
        .attr('name', String);

      expect(Thing.attributes).to.have.property('name');
    });

    it('defaults required to false', function() {
      function Thing() {}
      ModelMe(Thing)
        .attr('name', String);

      expect(Thing.attributes.name.options).to.have.property('required', false);
    });

    it('defaults allowNull to true', function() {
      function Thing() {}
      ModelMe(Thing)
        .attr('name', String);

      expect(Thing.attributes.name.options).to.have.property('allowNull', true);
    });

    it('adds a getter for attributes', function() {
      function Thing() {}
      ModelMe(Thing)
        .attr('name', String, { required: true });
      var tester = new Thing();
      tester.name = 'Barbara Streisand';
      expect(tester.name).to.eql('Barbara Streisand');
    });
  });

  describe('.schema', function() {

    it('adds the attributes', function() {
      function Thing() {}
      ModelMe(Thing)
        .attr('name', String);

      expect(Thing.schema.properties).to.have.property('name');
    });

    context('when null is allowed', function() {

      function Thing() {}
      ModelMe(Thing)
        .attr('name', String);

      it('adds the proper validators', function() {
        expect(Thing.schema.properties.name).to.have.property('anyOf');
        expect(Thing.schema.properties.name.anyOf).to.include({ type: 'null' });
        expect(Thing.schema.properties.name.anyOf).to.include({ type: 'string' });
      });
    });

    context('when null is not allowed', function() {

      function Thing() {}
      ModelMe(Thing)
        .attr('name', String, { allowNull: false });

      it('adds the proper validators', function() {
        expect(Thing.schema.properties.name).to.have.property('type', 'string');
      });
    });

    context('when the attribute is required', function() {

      function Thing() {}
      ModelMe(Thing)
        .attr('name', String, { required: true });

      it('adds to the required list', function() {
        expect(Thing.schema.required).to.include('name');
      });
    });
  });

  it('keeps attributes separate', function() {
    function Thing(data) {}
    ModelMe(Thing)
      .attr('name', String, { required: true });
    var tester1 = new Thing();
    var tester2 = new Thing();
    tester1.name = 'Barbara Streisand';
    expect(tester2.name).to.be.undefined;
  });

  describe('validation', function() {

    function Thing(data) {}
    ModelMe(Thing)
      .attr('name', String, { required: true })
      .attr('description', String, { allowNull: true })
      .attr('width', String, { allowNull: false })
      .attr('height', Number)
      .attr('birthdate', Date);

    context('for a required attribute', function() {

      function Thing() {}
      ModelMe(Thing)
        .attr('name', String, { required: true });

      context('when a value is supplied', function() {

        var tester = new Thing();
        tester.name = 'Barbara Streisand';

        it('does not return an error', function(done) {
          tester.validate(function(err) {
            expect(err).to.be.null;
            return done();
          });
        });
      });

      context('when a value is not suppied', function() {

        var tester = new Thing();

        it('returns an error', function(done) {
          tester.validate(function(err) {
            expect(err).to.be.instanceof(ModelMe.ValidationError);
            expect(err.errors).to.include.property('name', 'is required.');
            return done();
          });
        });
      });
    });

    context('for an attribute that does not allow null', function() {

      function Thing() {}
      ModelMe(Thing)
        .attr('name', String, { allowNull: false });

      context('when a value is supplied', function() {

        var tester = new Thing();
        tester.name = 'Barbara Streisand';

        it('does not reurn an error', function(done) {
          tester.validate(function(err) {
            expect(err).to.be.null;
            return done();
          });
        });
      });

      context('when null is supplied', function() {

        var tester = new Thing();
        tester.name = null;

        it('returns an error', function(done) {
          tester.validate(function(err) {
            expect(err).to.be.instanceof(ModelMe.ValidationError);
            expect(err.errors).to.include.property('name', 'Invalid type: null (expected string)');
            return done();
          });
        });
      });
    });

    it('returns the validated object', function(done) {
      var tester = new Thing();
      tester.name = 'barbara Streisand';
      tester.validate(function(err, obj) {
        if (err) { return done(err); }
        expect(obj).to.be.instanceof(Thing);
        return done();
      });
    });
  });

  describe('#toJSON', function() {

    function Thing(data) {}

    ModelMe(Thing)
      .attr('name', String);

    it('contains only attributes', function() {
      var thing = new Thing();
      thing.name = 'Barbara Streisand';
      expect(thing.toJSON()).to.have.all.keys('name');
    });
  });
});

