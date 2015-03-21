var ModelMe = exports = module.exports = function(fn) {
  var proto = {
  };

  fn.prototype = Object.create(fn.prototype || {}, proto);

  Object.defineProperties(fn, {
    attr: {
      value: function(name) {
      },
      enumerable: true,
      writable: true
    }
  });

  return fn;
};
