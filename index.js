'use strict';

var Validations = require('./lib/validations'),
    tv4 = require('tv4'),
    util = require('util');

var ModelMeError = function ModelMeError(message, name) {
  ModelMeError.super_.call(message);
  this.name = name || 'ModelMeError';
};
util.inherits(ModelMeError, Error);

var ValidationError = function ValidationError(message, errors) {
  ValidationError.super_.call(this, message, 'ValidationError');
  this.errors = errors || {};
};
util.inherits(ValidationError, ModelMeError);

function ModelMe(fn) {
  var proto = {
    validate: {
      value: function(cb) {
        var self = this;
        var result = tv4.validateMultiple(this.attributes, this.constructor.schema);
        if (result.valid) {
          return cb(null, self);
        } else {
          this.handleErrors(result.errors);
          var err = new ValidationError('Validation Failed', this.errors);
          return cb(err, self);
        }
      },
      enumerable: true,
      writable: true
    },
    attributes: {
      get: function() {
        if (!this._attributes) { this._attributes = {}; }
        return this._attributes;
      },
      set: function(val) {
        this._attributes = val;
      },
      enumerable: true
    },
    errors: {
      get: function() {
        if (!this._errors) { this._errors = {}; }
        return this._errors;
      },
      set: function(val) {
        this._errors = val;
      },
      enumerable: true
    },
    handleErrors: {
      value: function(errors) {
        var err,
            attr;
        var self = this;
        self.errors = {};

        function addError(code, options) {
          if (self.errors[attr] && code != tv4.errorCodes.OBJECT_REQUIRED) {
            return;
          }
          self.errors[attr] = self.constructor.getMessage(err, options);
        }

        for (var i = 0; i < errors.length; i++) {
          err = errors[i];
          switch(err.code) {
            case tv4.errorCodes.INVALID_TYPE:
              attr = err.schemaPath.split('/')[2];
              addError.call(this, err);
              break;
            case tv4.errorCodes.OBJECT_REQUIRED:
              attr = this.constructor.schema.required[err.schemaPath.split('/')[2]];
              addError.call(this, err);
              break;
          }
        }
      }
    }
  };

  var _schema = {
    type: 'object',
    properties: {},
    required: []
  };
  var fnName = fn.name;

  Object.defineProperties(fn, {
    schema: {
      get: function() {
        return _schema;
      },
      enumerable: true
    },
    attr: {
      value: function(name, type, options) {
        var jsonType;
        var opts = options || {};
        switch(type) {
          case String:
            jsonType = 'string';
            break;
          case Array:
            jsonType = 'array';
            break;
          case Number:
            jsonType = 'number';
            break;
          case Boolean:
            jsonType = 'boolean';
            break;
          default:
            jsonType = 'object';
            break;
        }
        fn.schema.properties[name] = {
          type: jsonType
        };
        if (opts.required) {
          (new Validations.RequiredValidator(name)).add(fn.schema);
        }
        Object.defineProperty(fn.prototype, name, {
          get: function() { return this.attributes[name]; },
          set: function(value) { this.attributes[name] = value; }
        });
        return fn;
      },
      enumerable: true,
      writable: true
    },
    validate: {
      value: function(attr, validator) {
        var v;
        switch(validator) {
          case Validations.Required:
            v = new Validations.RequiredValidator(attr);
            break;
        }
        v.add(fn.schema);
        return fn;
      },
      enumerable: true
    },
    getMessage: {
      value: function(err) {
        switch(err.code) {
          case tv4.errorCodes.OBJECT_REQUIRED:
            return 'is required.';
          case tv4.errorCodes.INVALID_TYPE:
            return err.message.replace('ValidationError: ', '');
          default:
            return 'Oops.';
        }
      }
    }
  });

  fn.prototype = Object.create(fn.prototype || {}, proto);

  return fn;
}

ModelMe.Validations = Validations;
ModelMe.ValidationError = ValidationError;

exports = module.exports = ModelMe;
