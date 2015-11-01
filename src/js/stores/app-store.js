var Store =  require('./store');
var UsersStore = require('./users-store');
var _ = require('underscore');

var AppStore = new Store({
  
  scheme: {
    call_completed:         false, 
    ice_servers:            null,
    ice_servers_expire_at:  null,
    user_id:                null,
    organization_id:        null,
    muted:                  false,
    online:                 true,
    stream:                 null,
    level:                  null
  },

  actions: {
    'user.configuration':       'reset',
    'webrtc.stream.remote':     'webrtcConnected',
    'webrtc.disconnected':      'webrtcDisconnected',
    'channel.left':             'checkCallCompleted'
  },

  reset: function(data) {
    this.set({
      ice_servers: data.ice_servers,
      ice_servers_expire_at: data.ice_servers_expire_at,
      user_id: data.user.id,
      level: data.user.level
    })
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


