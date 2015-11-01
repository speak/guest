var Flux = require('delorean').Flux;
var _ = require('underscore');

var AppStore = Flux.createStore({
  
  scheme: {
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
    'webrtc.disconnected':      'webrtcDisconnected'
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
  }
});

module.exports = AppStore;


