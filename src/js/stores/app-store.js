var Flux = require('delorean').Flux;
var _ = require('underscore');

var AppStore = Flux.createStore({
  
  scheme: {
    user_id:         null,
    organization_id: null,
    muted:           false,
    online:          true,
    stream:          null,
    level:           null
  },

  actions: {
    'user.configuration':       'reset',
    'webrtc.stream.remote':     'webrtcConnected',
    'webrtc.disconnected':      'webrtcDisconnected'
  },

  reset: function(data) {
    this.set({
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


