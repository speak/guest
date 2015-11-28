var Store =  require('./store');
var MediaManager = require('../libs/media-manager');
var _ = require('underscore');

var AppStore = new Store({

  scheme: {
    incompatible: {
      calculate: function () {
        return !MediaManager.browserHasSupport();
      }
    },
    app: {
      deps: ['user_id'],
      calculate: function() {
        return this.state.user_id;
      }
    },
    permission_granted:     true, //TODO
    permission_dialog:      false,
    permission_denied:      false,
    extension_loaded:       false,
    user_id:                null,
    muted:                  false,
    online:                 true,
    stream:                 null,
    gcm_registration_id:    null,
    typing:                 false,
    modal:                  false
  },

  actions: {
    'app.modal':                  'showModal',
    'extension.loaded':           'extensionLoaded',
    'session.connected':          'sessionConnected',
    'session.disconnected':       'sessionDisconnected',
    'user.extension_registered':  'extensionRegistered',
    'user.created':               'userLoaded',
    'user.found':                 'userLoaded',
    'user.typing':                'typing',
    'audio.unpublished':          'mute',
    'audio.published':            'unmute'
  },

  userLoaded: function(data) {
    this.set({user_id: data.id});
  },
  
  extensionLoaded: function() {
    this.set({extension_loaded: true});
  },
  
  extensionRegistered: function(data) {
    this.set({gcm_registration_id: data.registration_id});
  },
  
  showModal: function(name) {
    this.set({modal: name});
  },
  
  typing: function() {
    this.set({typing: true});
  },

  mute: function() {
    this.set({muted: true});
  },
  
  unmute: function() {
    this.set({muted: false});
  },

  sessionConnected: function() {
    this.set({stream: true});
  },
  
  sessionDisconnected: function() {
    this.set({stream: false});
  }
});

module.exports = AppStore;
