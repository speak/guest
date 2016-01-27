// getUserMedia helper by @HenrikJoreteg used for navigator.getUserMedia shim
var adapter = require('webrtc-adapter-test');
var _ = require('underscore'); 

// you can only have a max of these per application so we create
// a single context here for each renderer
if (window.AudioContext) var context = new AudioContext();

module.exports = {

  browserHasSupport: function() {
    return this.getAudioContext() && typeof navigator !== 'undefined' && navigator.getUserMedia;
  },

  getAudioContext: function() {
    return context;
  },

  getAudioConstraints: function(callback) {
    var PreferencesStore = require('../stores/preferences-store');
    var state = PreferencesStore.getState();
  
    // NOTE: audio constraints below come from Google Hangouts
    // http://webrtchacks.com/hangout-analysis-philipp-hancke/
    var constraints = {
      "optional": [
        {"googEchoCancellation": true},
        {"googEchoCancellation2": true},
        {"googAutoGainControl": true},
        {"googAutoGainControl2": true},
        {"googNoiseSuppression": true},
        {"googNoiseSuppression2": true},
        {"googHighpassFilter": true}
      ]
    };
  
    if (state.audio_input) {
      this.isAudioSourceAvailable(state.audio_input, function(available){
        if (available) {
          constraints.optional.push({"sourceId": state.audio_input});
        }
      
        callback({
          audio: constraints,
          video: false
        });
      });
    }
  
    callback({
      audio: constraints,
      video: false
    }); 
  },

  getVideoConstraints: function(callback) {
    var PreferencesStore = require('../stores/preferences-store');
    var state = PreferencesStore.getState();
  
    var constraints = {
      "mandatory": {
        "maxFrameRate": 20,
        "maxWidth": 400,
        "maxHeight": 300
      },
      "optional": [
        {"minAspectRatio": "1.332"},
        {"maxAspectRatio": "1.334"}
      ]
    };

    if (state.video_input) {
      this.isVideoSourceAvailable(state.video_input, function(available){
        if (available) {
          constraints.optional.push({"sourceId": state.video_input});
        }
      
        callback({
          audio: false,
          video: constraints
        });
      });
    }

    callback({
      audio: false,
      video: constraints
    }); 
  },

  getCurrentVideoSource: function(cb) {
    var PreferencesStore = require('../stores/preferences-store');
    var videoInput = PreferencesStore.get('video_input');
    if (!videoInput) return cb(null);
  
    this.isVideoSourceAvailable(videoInput, function(available){
      cb(available ? videoInput : null);
    });
  },

  isVideoSourceAvailable: function(sourceId, cb) {
    this.isSourceAvailable(sourceId, 'videoinput', cb);
  },

  isAudioSourceAvailable: function(sourceId, cb) {
    this.isSourceAvailable(sourceId, 'audioinput', cb);
  },

  getVideoSources: function(cb) {
    this.getSources('videoinput', cb);
  },

  getAudioSources: function(cb) {
    this.getSources('audioinput', cb);
  },

  getAudioOutputDevices: function(cb) {
    navigator.mediaDevices.enumerateDevices().then(function(sources){
      cb(this.filterSourcesFor(sources, 'audiooutput'));
    }.bind(this));
  },

  isSourceAvailable: function(sourceId, type, cb) {
    this.getSources(type, function(sources){
      cb(!!_.findWhere(sources, {id: sourceId}));
    });
  },

  getSources: function(type, cb) {
    navigator.mediaDevices.enumerateDevices().then(function(sources){
      cb(this.filterSourcesFor(sources, type));
    }.bind(this));
  },

  filterSourcesFor: function(sources, type) {
    return _.filter(sources, function(source) { 
      return source.kind == type; 
    });
  }
}