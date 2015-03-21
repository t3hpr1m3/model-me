var chai = require('chai'),
    expect = chai.expect,
    ModelMe = require('../index'),
    assert = require('assert');

describe('ModelMe', function() {

  it ('decorates the class', function() {

    function Thing(data) {
      this.setData(data);
    }

    ModelMe(Thing);

    ['attr'].forEach(function(method) {
      expect(Thing).itself.to.respondTo(method);
    });
  });

  describe('.attr', function() {
  });
});
