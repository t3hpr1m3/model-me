'use strict';

var extend = require('extend'),
    formats = require('tv4-formats'),
    util = require('util'),
    tv4 = require('tv4'),
    Validations = require('./lib/validations');

tv4.addFormat(formats);

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
  var _schema = null,
      _attributes = {},
      fnName = fn.name;

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
          // if (self.errors[attr] && code != tv4.errorCodes.OBJECT_REQUIRED) {
          //   return;
          // }
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
    },
    toJSON: {
      value: function() {
        var json = {};
        var data = this.attributes || {};
        for (var key in data) {
          var value = data[key];
          if (value) { json[key] = value; }
        }
        return json;
      },
      writable: true
    }
  };

  Object.defineProperties(fn, {
    schema: {
      get: function() {
        if (!_schema) {
          _schema = {
            type: 'object',
            properties: {},
            required: []
          };

          Object.keys(_attributes).forEach(function(name) {
            var attribute = _attributes[name];
            attribute.validators.forEach(function(v) {
              v.add(_schema);
            });
          });
        }
        return _schema;
      },
      enumerable: true
    },
    attributes: {
      get: function() {
        return _attributes;
      },
      enumerable: true
    },
    attr: {
      value: function(name, type, options) {
        var attribute = {
          type: type,
          validators: [],
          options: extend({ required: false, allowNull: true }, options || {})
        };

        attribute.validators.push(new Validations.TypeValidator(name, attribute));
        if (attribute.options.required) {
          attribute.validators.push(new Validations.RequiredValidator(name, attribute));
        }

        _attributes[name] = attribute;

        Object.defineProperty(fn.prototype, name, {
          get: function() { return this.attributes[name]; },
          set: function(value) { this.attributes[name] = value; },
          enumerable: true
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
