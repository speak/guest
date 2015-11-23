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
      deps: ['socks', 'has_configuration'],
      calculate: function() {
        return this.state.socks && this.state.has_configuration;
      }
    },
    permission_granted:     false,
    permission_dialog:      false,
    permission_denied:      false,
    extension_loaded:       false,
    ice_servers:            null,
    ice_servers_expire_at:  null,
    user_id:                null,
    organization_id:        null,
    muted:                  false,
    online:                 true,
    stream:                 null,
    level:                  null,
    has_configuration:      false,
    gcm_registration_id:    null,
    socks:                  false,
    typing:                 false,
    modal:                  false
  },

  actions: {
    'app.modal':                  'showModal',
    'extension.loaded':           'extensionLoaded',
    'session.connected':          'sessionConnected',
    'session.disconnected':       'sessionDisconnected',
    'user.extension_registered':  'extensionRegistered',
    'user.configuration':         'reset',
    'user.typing':                'typing',
    'user.mute':                  'mute',
    'user.unnmute':               'unmute',
    'socks.connected':            'socksConnected',
    'socks.disconnected':         'socksDisconnected'
  },

  reset: function(data) {
    this.set({
      ice_servers: data.ice_servers,
      ice_servers_expire_at: data.ice_servers_expire_at,
      user_id: data.user.id,
      has_configuration: true,
      level: data.user.level
    });
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

  socksConnected: function(){
    this.set({socks: true});
  },
  
  socksDisconnected: function() {
    this.set({socks: false});
  },

  sessionConnected: function() {
    this.set({stream: true});
  },
  
  sessionDisconnected: function() {
    this.set({stream: false});
  }
});

module.exports = AppStore;
