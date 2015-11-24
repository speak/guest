var AppDispatcher = require('../dispatcher/app-dispatcher');
var Analytics = require('../libs/analytics');
var Api = require('../libs/api');
var Config = require('config');

var AppActions = {
  online: function() {
    AppDispatcher.dispatch('app.online');
  },

  offline: function() {
    AppDispatcher.dispatch('app.offline');    
  },
  
  error: function(message) {
    AppDispatcher.dispatch('app.error', message);
  },

  preferences: function(data) {
    AppDispatcher.dispatch('app.preferences', data);
  },
  
  signOut: function() {
    AppDispatcher.dispatch('session.destroy');
    window.history.pushState("Speak", "Speak", "/");
  },

  netscanResults: function(results) {
    AppDispatcher.dispatch('netscan.results', results);
  },

  quitting: function() {
    AppDispatcher.dispatch('app.quitting');
  },
  
  extensionLoaded: function() {
    AppDispatcher.dispatch('extension.loaded');
  },
  
  extensionRegistered: function(id) {
    AppDispatcher.dispatch('user.extension_registered', {
      registration_id: id
    });
  },

  requestConfiguration: function() {
    AppDispatcher.dispatch('user.configure');
  },
  
  channelLoad: function(id) {
    AppDispatcher.dispatch('channel.loading', id);

    Api.get({
      endpoint: '/channels/' + id,
    })
    .done(this.channelFound)
    .fail(this.channelLoadError);
  },
  
  channelLoadError: function(xhr){
    if(xhr.status == 404) {
      AppDispatcher.dispatch('channel.not_found');
    } else {
      AppDispatcher.dispatch('channel.not_authorized');
    }
  },

  channelFound: function(data) {
    AppDispatcher.dispatch('channel.found', data);
  },

  channelCreate: function(data) {
    Api.post({
      endpoint: '/channels',
      data: data
    })
    .done(function(data){
      AppDispatcher.dispatch('channel.created', data);
    });
  }
};

module.exports = AppActions;
