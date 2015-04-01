var chai = require('chai'),
    expect = chai.expect,
    ModelMe = require('../index'),
    assert = require('assert');

describe('ModelMe', function() {

  it ('decorates the class', function() {

    function Thing(data) { }

    ModelMe(Thing);

    ['schema'].forEach(function(method) {
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

    ['validate'].forEach(function(method) {
      expect(Thing).to.respondTo(method);
    });
  });

  describe('.attr', function() {
    it('adds to the schema', function() {
      function Thing(data) {}
      ModelMe(Thing)
        .attr('name', String);

      expect(Thing.schema).to.have.property('name');
    });

    it('sets up validations', function() {
      function Thing(data) {}

      ModelMe(Thing)
        .attr('name', String, { required: true });

      expect(Thing.schema.required).to.include('name');
    });
  });

  it('validates required attrs', function(done) {
    function Thing(data) {}
    ModelMe(Thing)
      .attr('name', String, { required: true });
    var tester = new Thing();
    tester.validate(function(err) {
      expect(err).to.be.instanceof(ModelMe.ValidationError);
      done();
    });
  });

  it('adds a getter for attributes', function() {
    function Thing(data) {}
    ModelMe(Thing)
      .attr('name', String, { required: true });
    var tester = new Thing();
    tester.name = 'Barbara Streisand';
    expect(tester.name).to.eql('Barbara Streisand');
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
});
