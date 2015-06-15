'use strict';

var extend = require('extend'),
    util = require('util');

var Validations = {
  Required: 0x001,
  Type: 0x002
};

function BaseValidator(name, attr) {
  this.name = name;
  this.attr = attr;
}

Validations.RequiredValidator = function(name, attr) {
  Validations.RequiredValidator.super_.call(this, name, attr);
};

util.inherits(Validations.RequiredValidator, BaseValidator);

Validations.RequiredValidator.prototype = {
  add: function(schema) {
    schema.required.push(this.name);
  }
};

Validations.TypeValidator = function(name, attr) {
  Validations.TypeValidator.super_.call(this, name, attr);
};

util.inherits(Validations.TypeValidator, BaseValidator);

Validations.TypeValidator.prototype.add = function(schema) {
  var jsonType = null;

  switch(this.attr.type) {
    case String:
      jsonType = { type: 'string' };
      break;
    case Array:
      jsonType = { type: 'array' };
      break;
    case Number:
      jsonType = { type: 'number' };
      break;
    case Boolean:
      jsonType = { type: 'boolean' };
      break;
    case Date:
      jsonType = { type: 'string', format: 'date-time' };
      break;
    default:
      jsonType = { type: 'object' };
      break;
  }

  if (!schema.properties[this.name]) {
    schema.properties[this.name] = {};
  }

  if (this.attr.options.allowNull) {
    schema.properties[this.name].anyOf = [{ type: 'null' }];
    schema.properties[this.name].anyOf.push(jsonType);
  } else {
    schema.properties[this.name] = jsonType;
  }
};

exports = module.exports = Validations;

