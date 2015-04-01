var Validations = require('../../lib/validations');
var chai = require('chai'),
    expect = chai.expect;

describe('RequiredValidator', function() {
  it('applies the validation to the schema', function() {
    var schema = {
      required: []
    };

    var v = new Validations.RequiredValidator('name');
    v.add(schema);
    expect(schema.required).to.include('name');
  });
});
