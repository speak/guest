var PeerConnection = require('rtcpeerconnection');
var AppDispatcher = require('../dispatcher/app-dispatcher');
var WebRTCActions = require('../actions/webrtc-actions');
var AppActions = require('../actions/app-actions');
var MediaManager = require('./media-manager');
// var Stopwatch = require('./stopwatch');
var Config = require('config');
var _ = require('underscore');
var connectionsCount = 0;

// create a fake audio source so that we can turn the microphone
// on and off independent of the webrtc stream
var context = MediaManager.getAudioContext();
var proxy_destination = context.createMediaStreamDestination();
var proxy_stream = proxy_destination.stream;

var WebRTC = {
  
  remote_stream: null,
  proxy_destination: proxy_destination,
  
  connecting: false,         // If we are obtaining a connection
  connected: false,          // If we have an open connection
  manually_closed: false,    // true if we closed with no need to reconnect
  connect_timeout: null,
  connect_drop_timeout: 5000,// after x ms, give up and try connecting again
  connect_failed_timeout: 10000,
  reconnect_timeout: null,
  reconnect_attempts: 0,     // The number of attempted reconnects since success
  interval_stats: null,
  ice_servers: null,
  server: null,
  channel_id: null,
  
  actions: {
    'signaling.audio_answer':           'handleAnswer',
    'webrtc.connect':                   'connect',
    'webrtc.disconnect':                'cancel',
    'session.destroyed':                'cancel'
  },
  
  initialize: function() {
    _.bindAll(this, 'handleOffer', 'handleFailedOffer', 'handleAddStream', 
    'endOfCandidates', 'checkStateChange', 'handleConnectTimeout', 'handleIce');
  },

  connect: function(data) {
    this.server = this.server || data.server;
    this.channel_id = this.channel_id || data.channel_id;
    this.token = this.token || data.token;
    console.log('WebRTC: connect called => server: ' + this.server + ', channel: ' + this.channel_id + ', token: ' + this.token);

    if (!this.server) {
      return console.warn('WebRTC: connect called but no server available');
    }

    if (!this.channel_id) {
      return console.warn('WebRTC: connect called but no channel_id provided');
    }

    if (!this.token) {
      return console.warn('WebRTC: connect called but no token provided');
    }
    
    if (this.connecting) {
      return console.warn('WebRTC: connect called but already connecting');
    }

    // hang on there sugar, we already have a peer connection
    if (this.pc && this.connected) {
      return console.warn('WebRTC: connect called but connection already available');
    }

    var AppStore = AppDispatcher.getStore('appStore');
    var unique_id = ++connectionsCount;

    this.pc = new PeerConnection({
      iceServers: AppStore.ice_servers,
      id: unique_id
    });

    this.connecting = true;
    this.manually_closed = false;

    // add the proxy audio source
    this.pc.addStream(proxy_stream);

    // start new timers for this connection
    clearTimeout(this.connect_failed);
    this.connect_failed = setTimeout(this.handleConnectTimeout, this.connect_failed_timeout + (1000*this.reconnect_attempts));

    // setup callbacks
    this.pc.offer(this.getOfferConstraints(), this.handleOffer);
    this.pc.on('ice', unique_id, this.handleIce);
    this.pc.on('endOfCandidates', unique_id, this.endOfCandidates);
    this.pc.on('iceConnectionStateChange', unique_id, this.checkStateChange);
    this.pc.on('addStream', unique_id, this.handleAddStream);
    this.pc.on('error', unique_id, this.handleError);
  },

  cancel: function(reconnect_okay) {
    if (reconnect_okay !== true) {
      this.manually_closed = true;
      this.server = null;
    }
    this.disconnect();
  },

  getRemoteStream: function() {
    return this.remote_stream;
  },
  
  handleError: function(err) {
    // just send this straight to Sentry
    throw err;
  },
  
  handleAddStream: function(event){
    this.remote_stream = event.stream;
    WebRTCActions.remoteStream(event);
  },
  
  handleFailedOffer: function() {
    console.log("WebRTC: handleFailedOffer");

    // Clean up the old peer connection.
    // Simply deleting it probably won't work
    // as this is a nested javascript object,
    // and thus the actual PeerConnection won't be
    // garbage collected correctly at all times.
    if (this.pc) {
      this.pc.off(this.pc.config.id);
      this.pc.close();
      delete this.pc;

      this.connecting = false;
      this.connect();
    }
  },
  
  handleConnectTimeout: function() {
    console.log("WebRTC: handleConnectTimeout");
    this.disconnect();
  },
  
  // these three methods are async and therefore server
  // could have been cleared by the time they return
  handleOffer: function(err, offer) {
    if (err) throw err;

    // Stopwatch.mark('offer generated');
    offer.channel_id = this.channel_id;
    offer.token = this.token;
    
    // checking the state of the peer connection here as it is possible that
    // multiple offers are generated for a single connection due to our failure
    // timeout. In this case we throw away subsequent offers.
    if (this.server) {
      WebRTCActions.handleOffer(offer, this.server);
    } else {
      var signalingState = this.pc && this.pc.signalingState;
      console.warn("Offer generated but not handling", signalingState);
    }
  },
  
  handleIce: function(candidate) {
    if (this.server) {
      WebRTCActions.iceCandidate(candidate, this.server);
    }
  },

  endOfCandidates: function() {
    if (this.server) {
      WebRTCActions.endOfCandidates(this.server);
    }
  },
  
  handleAnswer: function(answer) {
    console.log('WebRTC: handleAnswer', answer);

    // as this is an async callback this is just a sanity check that the peer
    // connection still exists before we hand the answer through.
    if (this.pc) {
      // Stopwatch.mark('signaling audio_answer');
      this.pc.handleAnswer(answer);
    } else {
      console.warn('Answer received but not handling');
    }
  },
  
  checkStateChange: function() {
    console.log('WebRTC: checkStateChange', !!this.pc && this.pc.iceConnectionState);
    
    if (this.pc) {
      switch(this.pc.iceConnectionState) {
        case 'closed':
        case 'failed':
        //case 'disconnected': this gets triggered when a connection is bad
          return this.ondisconnected();
        case 'connected': // found a usable connection, but is still testing more remote candidates
          return this.onconnected();
        case 'completed': // found a usable connection and is no longer testing remote candidates
          return this.onconnected();
      }
    }
  },

  disconnect: function() {
    console.log('WebRTC: disconnect');
    this.remote_stream = null;
    
    clearTimeout(this.connect_failed);
    clearInterval(this.interval_stats);
    WebRTCActions.remoteStream();
    // Stopwatch.reset();
    
    if (this.pc) {
      console.log("Removing listeners for pc ", this.pc.config.id);
      this.pc.off(this.pc.config.id);
      this.pc.close();
    } else {
      this.ondisconnected();
    }
    
    WebRTCActions.stats({
      stats: {},
      state: {}
    });
  },
  
  onconnected: function() {
    console.log('WebRTC: onconnected');
    clearTimeout(this.connect_failed);
    
    if (!this.connected) {
      this.connected = true;
      this.connecting = false;
      this.reconnect_attempts = 0;

      clearInterval(this.interval_stats);
      this.interval_stats = setInterval(_.bind(this.collectStats, this), 1000);
      
      // Stopwatch.mark('webrtc connected');
      WebRTCActions.connected();
    }
  },
  
  ondisconnected: function() {
    console.log('WebRTC: ondisconnected');
    if(!this.pc) return;
    this.pc.off(this.pc.config.id);
    delete this.pc;
    
    this.connecting = false;
    
    // we want to retry the connection if not manually closed, not connected
    // and under the maximum retry attempts
    var retry = !this.manually_closed && !this.connected && this.reconnect_attempts < 2;
    
    if (retry) {
      this.reconnect_attempts = this.reconnect_attempts + 1;
      console.log("WebRTC connection timed out: retrying: " + this.reconnect_attempts);
      this.connect();
    } else {
      if(this.reconnect_attempts >= 2) {
        AppActions.bannerError("Whoops, we couldn't get a connection");
      }
      
      var channel_id = this.channel_id;
      this.reconnect_attempts = 0;
      this.manually_closed = false;
      this.connected = false;
      this.token = null;
      this.server = null;
      this.channel_id = null;
      WebRTCActions.disconnected({channel_id: channel_id});
    }
  },

  collectStats: function() {
    var windows = AppDispatcher.getStore('appStore').windows;
    var debugging = windows && windows.debugging && windows.debugging.visible;

    if (this.pc && debugging) {
      var self = this;

      this.pc.getStats(function(err, stats){
        WebRTCActions.stats({
          stats: stats,
          state: _.extend({server: self.server}, _.pick(self.pc, 'hadLocalRelayCandidate', 'hadLocalStunCandidate', 'hadRemoteRelayCandidate', 'hadRemoteStunCandidate', 'iceConnectionState', 'signalingState'))
        });
      });
    }
  },

  getOfferConstraints: function() {
    return {
      offerToReceiveAudio: true,
      offerToReceiveVideo: false 
    };
  },

  dispatchAction: function(action, payload) {
    var callback = this.actions[action];
    if (callback) {
      if (this[callback]) {
        this[callback].call(this, payload);
      } else {
        throw new Error("WebRTC callback "+ callback +" does not exist for action " + action);
      }
    }
  }
};

WebRTC.initialize();

module.exports = WebRTC;
