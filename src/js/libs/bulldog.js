var BulldogActions = require('../actions/bulldog-actions');
var utils = require('./utilities');
var $ = require('jquery-browserify');
var _ = require('underscore');
var Config = require('config');

var Bulldog = {
  
  createUser: function(data, options) {
    options = options || {};
    
    Bulldog.post({
      endpoint: '/users',
      data: data
    })
    .done(options.success || BulldogActions.signedIn)
    .fail(function(xhr){
      this.dispatchError(xhr, options);
    }.bind(this));
  },
  
  createSessionFromEmailPassword: function(data, options) {
    options = options || {};
    
    Bulldog.post({
      endpoint: '/sessions',
      data: data
    })
    .done(BulldogActions.signedIn)
    .fail(function(xhr){
      this.dispatchError(xhr, options);
    }.bind(this));
  },
  
  createSessionFromToken: function(token) {
    var self = this;
    
    Bulldog.post({
      endpoint: '/tickets',
      data: {
        token: token
      }
    })
    .done(function(data){
      clearTimeout(self.timeoutRetry);
      BulldogActions.signedIn(data);
    })
    .fail(function(xhr) {
      // server couldn't be reached, retry
      if (xhr.status == 0 || xhr.status == 500) {
        self.timeoutRetry = setTimeout(function(){
          self.createSessionFromToken(token);
        }, 3*1000);
      } else {
        self.dispatchError(xhr);
      }
    });
  },

  updatePassword: function(password, password_confirmation, token, success, error) {
    var self = this;
    Bulldog.put({
      endpoint: '/password',
      data: {
        password: password,
        password_confirmation: password_confirmation,
        token: token
      }
    })
    .done(function(data){
      if(success) {
        success();
      } else {
        BulldogActions.passwordUpdated(data);
      }
    })
    .fail(function(xhr) {
      if(error) {
        error();
      } else {
        BulldogActions.passwordUpdateFailed(JSON.parse(xhr.responseText));
      }
    })
  },

  createUploadAuth: function(token, key, type, success, error) {
    Bulldog.post({
      endpoint: '/upload/auth',
      data: {
        token: token,
        key: key,
        bucket: Config.storage.avatars,
        content_type: type,
        acl: 'public-read'
      }
    })
    .done(function(data){
      if(typeof success == "function") {
        success(data);
      }
    })
    .fail(function(xhr) {
      if(typeof error == "function") {
        error(xhr);
      }
    });
  },

  createPasswordReset: function(email){
    Bulldog.post({
      endpoint: '/password/reset',
      data: {
        email: email
      }
    })
    .done(function(data){
      BulldogActions.passwordResetRequested();
    })
    .fail(this.dispatchError);
  },
  
  dispatchError: function(xhr, options) {
    var response;
    
    try {
      response = JSON.parse(xhr.responseText);
      response.status = xhr.status;
    } catch(e) {
      response = {error: ""};
    }
    
    if (options && options.error) {
      options.error(xhr, response);
    }
    
    BulldogActions.error(response);
  },
  
  get: function(data) {
    data.type = 'GET';
    return this.request(data);
  },

  put: function(data) {
    data.type = 'PUT';
    return this.request(data);
  },
  
  post: function(data) {
    data.type = 'POST';
    return this.request(data);
  },
  
  request: function(options) {
    options = _.extend({url: Config.hosts.bulldog}, options);
    options.data = options.data || {};
    
    if (options.endpoint) options.url += options.endpoint;
    
    // add the device_id to every auth request
    options.data.device_id = this.getDeviceId();
    
    // we're only dealing with JSON.
    options.crossDomain = true;
    options.dataType = 'json';
    
    return $.ajax(options);
  },
  
  getDeviceId: function() {
    var device_id;
    device_id = localStorage.getItem('device_id');
    if (!device_id) {
      device_id = utils.guid();
      localStorage.setItem('device_id', device_id);
    }
    return device_id;
  }
};

module.exports = Bulldog;
