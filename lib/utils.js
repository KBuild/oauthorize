/**
 * Module dependencies.
 */
var crypto = require('crypto');


/**
 * Percent-encodes `str` per RFC 3986.
 *
 * References:
 *  - [Percent Encoding](http://tools.ietf.org/html/rfc5849#section-3.6)
 *  - [Parameter Encoding](http://oauth.net/core/1.0a/#encoding_parameters)
 *  - [Parameter Encoding](http://oauth.net/core/1.0/#encoding_parameters)
 *
 * @param {String} str
 * @api private
 */
exports.encode = function(str) {
  return encodeURIComponent(str)
    .replace(/!/g,'%21')
    .replace(/'/g,'%27')
    .replace(/\(/g,'%28')
    .replace(/\)/g,'%29')
    .replace(/\*/g,'%2A');
}

/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar' }
 *       , b = { bar: 'baz' };
 *     
 *     utils.merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api private
 */
exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
exports.uid = function(len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

exports.parseHeader = function(headers) {
    if (headers && headers['authorization']) {
        var parts = headers['authorization'].split(' ');
        if (parts.length >= 2) {
            var scheme = parts[0];
            var credentials = null;
            parts.shift();
            credentials = parts.join(' ');
            if (/OAuth/i.test(scheme)) {
                return deserializeHeader(credentials);
            }
        }
    }
    return new Error("Cannot find header from request");
}

function deserializeHeader(credentials) {
  var params = {}
    , comps = credentials.match(/(\w+)="([^"]+)"/g);

  if (comps) {
    for (var i = 0, len = comps.length; i < len; i++) {
      var comp = /(\w+)="([^"]+)"/.exec(comps[i])
        , name = decodeURIComponent(comp[1])
        , val = decodeURIComponent(comp[2]);

      // Some clients (I'm looking at you request) erroneously add non-protocol
      // params to the `Authorization` header.  This check filters those params
      // out.  It also filters out the `realm` parameter, which is valid to
      // include in the header, but should be excluded for purposes of
      // generating a signature.
      if (name.indexOf('oauth_') == 0) {
        params[name] = val;
      }
    }
  }
  return params;
}

/**
 * Retrun a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

