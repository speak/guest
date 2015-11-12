var AppDispatcher = require('../dispatcher/app-dispatcher');
var Analytics = require('../libs/analytics');
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

  requestConfiguration: function() {
    AppDispatcher.dispatch('user.configure');
  },

  createChannel: function(data) {
    AppDispatcher.dispatch('channel.create', data);
  }
};

module.exports = AppActions;
