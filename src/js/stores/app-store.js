var Store =  require('./store');
var UsersStore = require('./users-store');
var _ = require('underscore');

var AppStore = new Store({
  
  scheme: {
    permission_granted:     false,
    permission_dialog:      false,
    permission_denied:      false,
    call_completed:         false,
    ice_servers:            null,
    ice_servers_expire_at:  null,
    user_id:                null,
    organization_id:        null,
    muted:                  false,
    online:                 true,
    stream:                 null,
    level:                  null,
    has_configuration:      false,
    socks:                  false,
    typing:                 false
  },

  actions: {
    'user.configuration':         'reset',
    'user.typing':                'typing',
    'webrtc.stream.local':        'webrtcPermissionsGranted',
    'webrtc.stream.remote':       'webrtcConnected',
    'webrtc.permissions':         'webrtcPermissions',
    'webrtc.permissions_granted': 'webrtcPermissionsGranted',
    'webrtc.disconnected':        'webrtcDisconnected',
    'channel.left':               'checkCallCompleted',
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
  
  typing: function() {
    this.set({typing: true});
  },

  socksConnected: function(){
    this.set({socks: true});
  },
  
  socksDisconnected: function() {
    this.set({socks: false});
  },

  webrtcPermissions: function(value) {
    if (value) this.set({permission_dialog: true});
    if (!value) this.set({permission_denied: true});
  },
  
  webrtcPermissionsGranted: function() {
    this.set({
      permission_granted: true,
      permission_dialog: false, 
      permission_denied: false
    });
  },
  
  webrtcConnected: function(stream_id) {
    this.set({stream: stream_id});
  },
  
  webrtcDisconnected: function() {
    this.set({stream: null});
  },
  
  checkCallCompleted: function() {
    if (!UsersStore.otherUsers().length) {
      this.set({call_completed: true});
    }
  }
});

module.exports = AppStore;
