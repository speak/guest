var AppDispatcher = require('../dispatcher/app-dispatcher');
var Config = require('config');

var appendServerToEvent = function(event, server) {
  server = (Config.environment == "development") ? "development" : server;
  return event + "." + server.replace(/\./g, "_");
}

var WebRTCActions = {
  connected: function() {
    AppDispatcher.dispatch('webrtc.connected');
  },
  
  disconnected: function(data) {
    AppDispatcher.dispatch('webrtc.disconnected', data);
  },
  
  remoteStream: function(data) {
    var stream = data && data.stream;
    AppDispatcher.dispatch('webrtc.stream.remote', stream ? stream.id : null);
  },
  
  handleOffer: function(offer, server) {
    AppDispatcher.dispatch(appendServerToEvent('signaling.audio_offer', server), offer);
  },
  
  iceCandidate: function(candidate, server) {
    AppDispatcher.dispatch(appendServerToEvent('signaling.audio_ice', server), candidate);
  },
  
  endOfCandidates: function(server) {
    AppDispatcher.dispatch(appendServerToEvent('signaling.audio_ice', server), {
      candidate: {
        candidate: null,
        sdpMLineIndex: 0,
        sdpMid: "audio"
      }
    });
  },
};

module.exports = WebRTCActions;
