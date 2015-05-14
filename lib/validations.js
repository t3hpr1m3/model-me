'use strict';

var Validations = {
  Required: 0x001,
};

Validations.RequiredValidator = function(attr) {
  this.attr = attr;
};

Validations.RequiredValidator.prototype.add = function(schema) {
  schema.required.push(this.attr);
};

exports = module.exports = Validations;
