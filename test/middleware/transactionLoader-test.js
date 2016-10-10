var vows = require('vows');
var assert = require('assert');
var url = require('url');
var util = require('util');
var transactionLoader = require('middleware/transactionLoader');


function MockRequest() {
}

function MockResponse() {
  this._headers = {};
  this._data = '';
}

MockResponse.prototype.setHeader = function(name, value) {
  this._headers[name] = value;
}

MockResponse.prototype.end = function(data, encoding) {
  this._data += data;
  if (this.done) { this.done(); }
}


vows.describe('transactionLoader').addBatch({
  
  'middleware that loads a transaction based on ID in query': {
    topic: function() {
      var server = {};
      server.deserializeClient = function(id, done) {
        return done(null, { id: id, name: 'Example' })
      }
      
      return transactionLoader(server);
    },

    'when handling a request': {
      topic: function(requestToken) {
        var self = this;
        var req = new MockRequest();
        req.query = { 'transaction_id': '1234' }
        req.session = {};
        req.session.authorize = {};
        req.session.authorize['1234'] = {
          client: '1',
          callbackURL: 'http://www.example.com/auth/callback',
          req: { callbackURL: 'http://www.example.com/auth/callback', foo: 'bar' },
          authz: { token: 'aaaa-bbbb-cccc', scope: 'write' }
        }
        
        var res = new MockResponse();
        res.done = function() {
          self.callback(new Error('should not be called'));
        }

        function next(err) {
          self.callback(null, req, res, err);
        }
        process.nextTick(function () {
          requestToken(req, res, next)
        });
      },

      'should not call done' : function(err, req, res, e) {
        assert.isNull(err);
      },
      'should not next with error' : function(err, req, res, e) {
        assert.isUndefined(e);
      },
      'should restore transaction' : function(err, req, res, e) {
        assert.isObject(req.session.oauth);
        assert.equal(req.session.oauth.transactionID, '1234');
        assert.equal(req.session.oauth.client.id, '1');
        assert.equal(req.session.oauth.client.name, 'Example');
        assert.strictEqual(req.session.oauth.client, req.session.oauth.consumer);
        assert.equal(req.session.oauth.callbackURL, 'http://www.example.com/auth/callback');
        assert.equal(req.session.oauth.req.callbackURL, 'http://www.example.com/auth/callback');
        assert.equal(req.session.oauth.req.foo, 'bar');
        assert.equal(req.session.oauth.authz.token, 'aaaa-bbbb-cccc');
        assert.equal(req.session.oauth.authz.scope, 'write');
      },
      'should leave transaction in session' : function(err, req, res, e) {
        assert.isObject(req.session['authorize']['1234']);
      },
    },
  },
  
  'middleware that loads a transaction based on ID in body': {
    topic: function() {
      var server = {};
      server.deserializeClient = function(id, done) {
        return done(null, { id: id, name: 'Example' })
      }
      
      return transactionLoader(server);
    },

    'when handling a request': {
      topic: function(requestToken) {
        var self = this;
        var req = new MockRequest();
        req.body = { 'transaction_id': '1234' }
        req.session = {};
        req.session.authorize = {};
        req.session.authorize['1234'] = {
          client: '1',
          callbackURL: 'http://www.example.com/auth/callback',
          req: { callbackURL: 'http://www.example.com/auth/callback', foo: 'bar' },
          authz: { token: 'aaaa-bbbb-cccc', scope: 'write' }
        }
        
        var res = new MockResponse();
        res.done = function() {
          self.callback(new Error('should not be called'));
        }

        function next(err) {
          self.callback(null, req, res, err);
        }
        process.nextTick(function () {
          requestToken(req, res, next)
        });
      },

      'should not call done' : function(err, req, res, e) {
        assert.isNull(err);
      },
      'should not next with error' : function(err, req, res, e) {
        assert.isUndefined(e);
      },
      'should restore transaction' : function(err, req, res, e) {
        assert.isObject(req.session.oauth);
        assert.equal(req.session.oauth.transactionID, '1234');
        assert.equal(req.session.oauth.client.id, '1');
        assert.equal(req.session.oauth.client.name, 'Example');
        assert.strictEqual(req.session.oauth.client, req.session.oauth.consumer);
        assert.equal(req.session.oauth.callbackURL, 'http://www.example.com/auth/callback');
        assert.equal(req.session.oauth.req.callbackURL, 'http://www.example.com/auth/callback');
        assert.equal(req.session.oauth.req.foo, 'bar');
        assert.equal(req.session.oauth.authz.token, 'aaaa-bbbb-cccc');
        assert.equal(req.session.oauth.authz.scope, 'write');
      },
      'should leave transaction in session' : function(err, req, res, e) {
        assert.isObject(req.session['authorize']['1234']);
      },
    },
  },
  
  'middleware with transactionField option that loads a transaction': {
    topic: function() {
      var server = {};
      server.deserializeClient = function(id, done) {
        return done(null, { id: id, name: 'Example' })
      }
      
      return transactionLoader(server, { transactionField: 'txn_id' });
    },

    'when handling a request': {
      topic: function(requestToken) {
        var self = this;
        var req = new MockRequest();
        req.query = { 'txn_id': '1234' }
        req.session = {};
        req.session.authorize = {};
        req.session.authorize['1234'] = {
          client: '1',
          callbackURL: 'http://www.example.com/auth/callback',
          req: { callbackURL: 'http://www.example.com/auth/callback', foo: 'bar' },
          authz: { token: 'aaaa-bbbb-cccc', scope: 'write' }
        }
        
        var res = new MockResponse();
        res.done = function() {
          self.callback(new Error('should not be called'));
        }

        function next(err) {
          self.callback(null, req, res, err);
        }
        process.nextTick(function () {
          requestToken(req, res, next)
        });
      },

      'should not call done' : function(err, req, res, e) {
        assert.isNull(err);
      },
      'should not next with error' : function(err, req, res, e) {
        assert.isUndefined(e);
      },
      'should restore transaction' : function(err, req, res, e) {
        assert.isObject(req.session.oauth);
        assert.equal(req.session.oauth.transactionID, '1234');
        assert.equal(req.session.oauth.client.id, '1');
        assert.equal(req.session.oauth.client.name, 'Example');
        assert.strictEqual(req.session.oauth.client, req.session.oauth.consumer);
        assert.equal(req.session.oauth.callbackURL, 'http://www.example.com/auth/callback');
        assert.equal(req.session.oauth.req.callbackURL, 'http://www.example.com/auth/callback');
        assert.equal(req.session.oauth.req.foo, 'bar');
        assert.equal(req.session.oauth.authz.token, 'aaaa-bbbb-cccc');
        assert.equal(req.session.oauth.authz.scope, 'write');
      },
      'should leave transaction in session' : function(err, req, res, e) {
        assert.isObject(req.session['authorize']['1234']);
      },
    },
  },
  
  'middleware with sessionKey option that loads a transaction': {
    topic: function() {
      var server = {};
      server.deserializeClient = function(id, done) {
        return done(null, { id: id, name: 'Example' })
      }
      
      return transactionLoader(server, { sessionKey: 'oauthorize' });
    },

    'when handling a request': {
      topic: function(requestToken) {
        var self = this;
        var req = new MockRequest();
        req.query = { 'transaction_id': '1234' }
        req.session = {};
        req.session.oauthorize = {};
        req.session.oauthorize['1234'] = {
          client: '1',
          callbackURL: 'http://www.example.com/auth/callback',
          req: { callbackURL: 'http://www.example.com/auth/callback', foo: 'bar' },
          authz: { token: 'aaaa-bbbb-cccc', scope: 'write' }
        }
        
        var res = new MockResponse();
        res.done = function() {
          self.callback(new Error('should not be called'));
        }

        function next(err) {
          self.callback(null, req, res, err);
        }
        process.nextTick(function () {
          requestToken(req, res, next)
        });
      },

      'should not call done' : function(err, req, res, e) {
        assert.isNull(err);
      },
      'should not next with error' : function(err, req, res, e) {
        assert.isUndefined(e);
      },
      'should restore transaction' : function(err, req, res, e) {
        assert.isObject(req.session.oauth);
        assert.equal(req.session.oauth.transactionID, '1234');
        assert.equal(req.session.oauth.client.id, '1');
        assert.equal(req.session.oauth.client.name, 'Example');
        assert.strictEqual(req.session.oauth.client, req.session.oauth.consumer);
        assert.equal(req.session.oauth.callbackURL, 'http://www.example.com/auth/callback');
        assert.equal(req.session.oauth.req.callbackURL, 'http://www.example.com/auth/callback');
        assert.equal(req.session.oauth.req.foo, 'bar');
        assert.equal(req.session.oauth.authz.token, 'aaaa-bbbb-cccc');
        assert.equal(req.session.oauth.authz.scope, 'write');
      },
      'should leave transaction in session' : function(err, req, res, e) {
        assert.isObject(req.session['oauthorize']['1234']);
      },
    },
  },
  
  'middleware that has deauthorized a client': {
    topic: function() {
      var server = {};
      server.deserializeClient = function(id, done) {
        return done(null, false)
      }
      
      return transactionLoader(server);
    },

    'when handling a request': {
      topic: function(requestToken) {
        var self = this;
        var req = new MockRequest();
        req.query = { 'transaction_id': '1234' }
        req.session = {};
        req.session.authorize = {};
        req.session.authorize['1234'] = {
          client: '1',
          callbackURL: 'http://www.example.com/auth/callback',
          req: { callbackURL: 'http://www.example.com/auth/callback', foo: 'bar' },
          authz: { token: 'aaaa-bbbb-cccc', scope: 'write' }
        }
        
        var res = new MockResponse();
        res.done = function() {
          self.callback(new Error('should not be called'));
        }

        function next(err) {
          self.callback(null, req, res, err);
        }
        process.nextTick(function () {
          requestToken(req, res, next)
        });
      },

      'should not call done' : function(err, req, res, e) {
        assert.isNull(err);
      },
      'should next with error' : function(err, req, res, e) {
        assert.instanceOf(e, Error);
        assert.equal(e.constructor.name, 'AuthorizationError');
        assert.equal(e.code, 'consumer_key_rejected');
      },
      'should not restore transaction' : function(err, req, res, e) {
        assert.isUndefined(req.session.oauth);
      },
      'should remove transaction from session' : function(err, req, res, e) {
        assert.isUndefined(req.session['authorize']['1234']);
      },
    },
  },
  
  'middleware that errors while deserializing client': {
    topic: function() {
      var server = {};
      server.deserializeClient = function(id, done) {
        return done(new Error('something went wrong'))
      }
      
      return transactionLoader(server);
    },

    'when handling a request': {
      topic: function(requestToken) {
        var self = this;
        var req = new MockRequest();
        req.query = { 'transaction_id': '1234' }
        req.session = {};
        req.session.authorize = {};
        req.session.authorize['1234'] = {
          client: '1',
          callbackURL: 'http://www.example.com/auth/callback',
          req: { callbackURL: 'http://www.example.com/auth/callback', foo: 'bar' },
          authz: { token: 'aaaa-bbbb-cccc', scope: 'write' }
        }
        
        var res = new MockResponse();
        res.done = function() {
          self.callback(new Error('should not be called'));
        }

        function next(err) {
          self.callback(null, req, res, err);
        }
        process.nextTick(function () {
          requestToken(req, res, next)
        });
      },

      'should not call done' : function(err, req, res, e) {
        assert.isNull(err);
      },
      'should next with error' : function(err, req, res, e) {
        assert.instanceOf(e, Error);
      },
      'should not restore transaction' : function(err, req, res, e) {
        assert.isUndefined(req.session.oauth);
      },
      'should leave transaction in session' : function(err, req, res, e) {
        assert.isObject(req.session['authorize']['1234']);
      },
    },
  },
  
  'middleware handling a request without a transaction ID': {
    topic: function() {
      var server = {};
      server.deserializeClient = function(id, done) {
        return done(null, { id: id, name: 'Example' })
      }
      
      return transactionLoader(server);
    },

    'when handling a request': {
      topic: function(requestToken) {
        var self = this;
        var req = new MockRequest();
        req.session = {};
        req.session.authorize = {};
        
        var res = new MockResponse();
        res.done = function() {
          self.callback(new Error('should not be called'));
        }

        function next(err) {
          self.callback(null, req, res, err);
        }
        process.nextTick(function () {
          requestToken(req, res, next)
        });
      },

      'should not call done' : function(err, req, res, e) {
        assert.isNull(err);
      },
      'should not next with error' : function(err, req, res, e) {
        assert.isUndefined(e);
      },
      'should not restore transaction' : function(err, req, res, e) {
        assert.isUndefined(req.session.oauth);
      },
    },
  },
  
  'middleware handling a request without a transaction in the session': {
    topic: function() {
      var server = {};
      server.deserializeClient = function(id, done) {
        return done(null, { id: id, name: 'Example' })
      }
      
      return transactionLoader(server);
    },

    'when handling a request': {
      topic: function(requestToken) {
        var self = this;
        var req = new MockRequest();
        req.query = { 'transaction_id': '1234' }
        req.session = {};
        req.session.authorize = {};
        
        var res = new MockResponse();
        res.done = function() {
          self.callback(new Error('should not be called'));
        }

        function next(err) {
          self.callback(null, req, res, err);
        }
        process.nextTick(function () {
          requestToken(req, res, next)
        });
      },

      'should not call done' : function(err, req, res, e) {
        assert.isNull(err);
      },
      'should not next with error' : function(err, req, res, e) {
        assert.isUndefined(e);
      },
      'should not restore transaction' : function(err, req, res, e) {
        assert.isUndefined(req.session.oauth);
      },
    },
  },
  
  'middleware handling a request without a session': {
    topic: function() {
      var server = {};
      server.deserializeClient = function(id, done) {
        return done(null, { id: id, name: 'Example' })
      }
      
      return transactionLoader(server);
    },

    'when handling a request': {
      topic: function(requestToken) {
        var self = this;
        var req = new MockRequest();
        req.query = { 'transaction_id': '1234' }
        
        var res = new MockResponse();
        res.done = function() {
          self.callback(new Error('should not be called'));
        }

        function next(err) {
          self.callback(null, req, res, err);
        }
        process.nextTick(function () {
          requestToken(req, res, next)
        });
      },

      'should not call done' : function(err, req, res, e) {
        assert.isNull(err);
      },
      'should next with error' : function(err, req, res, e) {
        assert.instanceOf(e, Error);
      },
      'should not restore transaction' : function(err, req, res, e) {
        assert.isUndefined(req.session.oauth);
      },
    },
  },
  
  'middleware handling a request without authorize in session': {
    topic: function() {
      var server = {};
      server.deserializeClient = function(id, done) {
        return done(null, { id: id, name: 'Example' })
      }
      
      return transactionLoader(server);
    },

    'when handling a request': {
      topic: function(requestToken) {
        var self = this;
        var req = new MockRequest();
        req.query = { 'transaction_id': '1234' }
        req.session = {};
        
        var res = new MockResponse();
        res.done = function() {
          self.callback(new Error('should not be called'));
        }

        function next(err) {
          self.callback(null, req, res, err);
        }
        process.nextTick(function () {
          requestToken(req, res, next)
        });
      },

      'should not call done' : function(err, req, res, e) {
        assert.isNull(err);
      },
      'should next with error' : function(err, req, res, e) {
        assert.instanceOf(e, Error);
      },
      'should not restore transaction' : function(err, req, res, e) {
        assert.isUndefined(req.session.oauth);
      },
    },
  },
  
  'middleware constructed without a server instance': {
    'should throw an error': function () {
      assert.throws(function() { transactionLoader() });
    },
  },

}).export(module);
