var AuthStore = require('../stores/auth-store');
var ApiActions = require('../actions/api-actions');
var $ = require('jquery');
var _ = require('underscore');
var Config = require('config');

var Api = {

  dispatchError: function(xhr) {
    var response;

    try {
      response = JSON.parse(xhr.responseText);
      response.status = xhr.status;
    } catch(e) {
      response = {error: ""};
    }

    ApiActions.error(response);
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
    //TODO error out when no auth token
    options = _.extend({url: Config.hosts.api}, options);

    if (options.data) options.data = JSON.stringify(options.data);
    if (options.endpoint) options.url += options.endpoint;

    // we're only dealing with JSON.
    options.crossDomain = true;
    options.dataType = 'json';
    options.contentType = 'application/json';

    if(AuthStore.state.token) {
      options.beforeSend = function (xhr) {
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(AuthStore.state.token + ':'));
      }
    }

    return $.ajax(options);
  }
};

module.exports = Api;
