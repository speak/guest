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
    permissions_granted:     true, //TODO
    permissions_dialog:      false,
    permissions_denied:      false,
    extension_loaded:       false,
    user_id:                null,
    muted:                  false,
    online:                 true,
    stream:                 null,
    gcm_registration_id:    null,
    typing:                 false,
    modal:                  false,
    menu:                   false
  },

  actions: {
    'app.modal':                  'showModal',
    'app.menu':                   'toggleMenu',
    'webrtc.permissions_granted': 'permissionsGranted',
    'webrtc.permissions_denied':  'permissionsDenied',
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
  
  permissionsGranted: function() {
    this.set({
      permissions_granted: true, 
      permissions_denied: false
    });
  },
  
  permissionsDenied: function() {
    this.set({
      permissions_granted: false, 
      permissions_denied: true
    });
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
  
  toggleMenu: function(value) {
    this.set({menu: value});
  },
  
  typing: function(val) {
    this.set({typing: val});
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
