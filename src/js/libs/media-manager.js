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
  
  getDefaultMicrophoneInput: function(callback) {
    this.getAudioSources(function(sources){
      var found = false
      _.each(sources, function(source){
        if (!found && source.label.match(/microphone/i)) {
          found=true;
          callback(source);
        }
      })
    });
  },

  muteStream: function(stream) {
    if (!stream) return stream;
    
    var trackset = stream.getAudioTracks();
    for (var i in trackset) {
      if (trackset[i]) trackset[i].enabled = false;
    }
    return stream;
  },
  
  unmuteStream: function(stream) {
    if (!stream) return stream;
    
    var trackset = stream.getAudioTracks();
    for (var i in trackset) {
      if (trackset[i]) trackset[i].enabled = true;
    }
    return stream;
  },
  
  getAudioContext: function() {
    return context;
  },
  
  getAudioConstraints: function() {
    //TODO reinstate camera/audio selection
    // var PreferencesStore = require('../stores/preferences-store');
    // var state = PreferencesStore.getState();
    
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
    
    // https://code.google.com/p/webrtc/issues/detail?id=2243
    // Triggers Chrome to send audio output to the same device
    // that is receiving microphone input
    // if (state.audio_output == "built-in") {
    //   constraints.optional.push({"chromeRenderToAssociatedSink": true});
    // }
    
    // TODO: check that this sourceId still exists on the machine 
    // in the case that a microphone has been unplugged
    // if (state.audio_input) {
    //   constraints.optional.push({"sourceId": state.audio_input});
    // }
    
    return {
      audio: constraints,
      video: false
    }
  },
  
  getVideoConstraints: function() {
    //TODO reinstate camera/audio selection
    // var PreferencesStore = require('../stores/preferences-store');
    // var state = PreferencesStore.getState();
    
    var constraints = {
      "mandatory": {
        "maxFrameRate": 15,
        "maxWidth": 400,
        "maxHeight": 300
      },
      "optional": [
        {"minAspectRatio": "1.332"},
        {"maxAspectRatio": "1.334"}
      ]
    };

    // TODO: check that this sourceId still exists on the machine 
    // in the case that a microphone has been unplugged
    // if (state.video_input) {
    //   constraints.optional.push({"sourceId": state.video_input});
    // }

    return {
      audio: false,
      video: constraints
    }
  },
  
  getCurrentVideoSource: function(cb) {
    var videoInput = PreferencesStore.get('video_input');
    if (!videoInput) return cb(null);
    
    this.isVideoSourceAvailable(videoInput, function(available){
      cb(available ? videoInput : null);
    });
  },
  
  isVideoSourceAvailable: function(sourceId, cb) {
    this.isSourceAvailable(sourceId, 'video', cb);
  },
  
  isAudioSourceAvailable: function(sourceId, cb) {
    this.isSourceAvailable(sourceId, 'audio', cb);
  },

  getVideoSources: function(cb) {
    this.getSources('video', cb);
  },

  getAudioSources: function(cb) {
    this.getSources('audio', cb);
  },
  
  isSourceAvailable: function(sourceId, type, cb) {
    this.getSources(type, function(sources){
      cb(!!_.findWhere(sources, {id: sourceId}));
    });
  },
  
  getSources: function(type, cb) {
    var self = this;
    MediaStreamTrack.getSources(function(sources){
      cb(self.filterSourcesFor(sources, type));
    });
  },

  filterSourcesFor: function(sources, type) {
    return _.filter(sources, function(source) { 
      return source.kind == type; 
    });
  }
}
