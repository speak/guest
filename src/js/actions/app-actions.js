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
  
  userLoad: function(id) {
    return Api.get({
      endpoint: '/users/me',
    })
    .done(function(data) {
      AppDispatcher.dispatch('user.found', data.user);
    })
    .fail(this.signOut);
  },
  
  recordingsLoad: function() {
    return Api.get({
      endpoint: '/recordings',
    })
    .done(function(data) {
      AppDispatcher.dispatch('recordings.loaded', data.recordings);
    });
  },
  
  channelLoad: function(id) {
    AppDispatcher.dispatch('channel.loading', id);

    Api.get({
      endpoint: '/channels/' + id,
    })
    .done(function(data) {
      AppDispatcher.dispatch('channel.found', data.channel);
    })
    .fail(this.channelLoadError);
  },
  
  channelLoadError: function(xhr){
    if(xhr.status == 404) {
      AppDispatcher.dispatch('channel.not_found');
    } else {
      AppDispatcher.dispatch('channel.not_authorized');
    }
  },

  channelCreate: function(data) {
    Api.post({
      endpoint: '/channels',
      data: data
    })
    .done(function(data){
      AppDispatcher.dispatch('channel.created', data.channel);
      AppDispatcher.dispatch('channel.authed', data.channel_auth);
    });
  }
};

module.exports = AppActions;
