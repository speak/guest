var CallActions = require('../actions/call-actions');
var ChannelStore = require('../stores/channel-store');
var AppStore = require('../stores/app-store');
var AppActions = require('../actions/app-actions');
// var Stopwatch = require('./stopwatch');
var WebRTC = require('./webrtc');
var getUserMedia = require('getusermedia');
var MediaManager = require('./media-manager');
var hark = require('hark');
var _ = require('underscore');

var ringInterval = 2000;
var ringTimeout = 30000;

var Calls = {
  actions: {
    'user.configuration':        'userConfiguration',
    // 'user.mute':                 'muteLocalStream',
    // 'user.unmute':               'unmuteLocalStream',
    // 'user.start_speaking':       'startSpeaking',
    // 'user.stop_speaking':        'stopSpeaking',
    // 'session.destroy':           'disconnect',
    // 'session.error':             'disconnect',
    // 'socks.disconnected':        'disconnect',
    // 'user.disconnected':         'cleanupEmptyChannels',
    'app.request_audio_stream':  'requestStream',
    // 'me.channel.left':           'meChannelLeft',
    // 'me.channel.kicked':         'meChannelKicked',
    'me.channel.joined':         'meChannelJoined',
    'channel.leave':             'disconnect',
    // 'channel.left':              'deleteChannelIfEmpty',
    'channel.join':              'channelJoin',
    'channel.deleted':           'channelDeleted',
    'channel.defunct':           'channelDeleted',
    'channel.cancelled':         'channelCancelled',
    // 'channel.ignored':           'deleteChannelIfEmpty',
    // 'channel.timedout':          'channelTimedOut',
    'webrtc.disconnected':       'webrtcDisconnected'
  },

  userConfiguration: function(){
    console.log('user configured calls lib');
    //TODO only temporarily firing from here
    if(ChannelStore.state.id) {
      CallActions.connect(ChannelStore.state);
    }
  },

  reconnect_to: null,

  getLocalStream: function() {
    return this.local_stream;
  },

  updateLocalStream: function(stream) {
    console.log('Calls:updateLocalStream');
    this.stopLocalStream();

    var context = MediaManager.getAudioContext();
    this.microphone = context.createMediaStreamSource(stream);
    this.microphoneGain = context.createGain();

    // ensure new stream keeps our mute preference
    if (!AppStore.get('muted')) this.connectMicrophone();

    // begin processing new stream for speech events
    this.speech_events = hark(stream);
    this.speech_events.on('speaking', CallActions.startSpeaking);
    this.speech_events.on('stopped_speaking', CallActions.stopSpeaking);

    this.local_stream = stream;
  },

  connectMicrophone: function() {
    if (this.microphone) {
      this.microphone.connect(this.microphoneGain);
      this.microphoneGain.connect(WebRTC.proxy_destination);
    }
  },

  stopLocalStream: function() {
    // stop processing incoming audio / speech
    if (this.speech_events) {
      this.speech_events.off('speaking');
      this.speech_events.off('stopped_speaking');
      this.speech_events.stop();
      delete this.speech_events;
    }

    // disconnect mediastream source node from proxy destination
    if (this.microphone) this.microphone.disconnect();

    // release hardware
    if (this.local_stream) {
      this.local_stream.stop();
      delete this.local_stream;
    }
  },

  muteLocalStream: function() {
    // disconnects the microphone stream from the outgoing media
    if (this.microphone) this.microphone.disconnect();
  },

  unmuteLocalStream: function() {
    this.connectMicrophone();
  },

  requestStream: function(force) {
    if (force === true) this.activateMedia(true);
  },

  activateMedia: function(force) {
    console.log("Calls:activateMedia");

    if (!this.local_stream || force) {
      this.permissions_timeout = setTimeout(this.showPermissionsDialog, 500);
      
      getUserMedia(MediaManager.getAudioConstraints(), function(err, stream) {
        clearTimeout(this.permissions_timeout);
        
        if (err) {
          CallActions.permissionsDialog(false);
        } else {
          console.log("Calls:gotUserMedia");
          this.updateLocalStream(stream);
          CallActions.localStream({stream: stream});
        }
      }.bind(this));
    }
  },

  showPermissionsDialog: function() {
    CallActions.permissionsDialog(true);
  },
  
  webrtcDisconnected: function(data) {
    console.log('Calls:webrtcDisconnected');
    if(this.reconnect_to) {
      CallActions.connect(this.reconnect_to);
      this.reconnect_to = null;
    }
  },

  channelJoin: function(data) {
    this.connect(data);
  },

  channelDeleted: function(data) {
    //TODO
  },

  connect: function(data) {
    // if (!Stopwatch.isRunning()) {
    //   // start the timer from receivers side
    //   Stopwatch.start({
    //     params: {
    //       channel_id: data.id,
    //       server: data.server,
    //       initiator: false
    //     },
    //     stop: function(timings) {
    //       // as the events are async and can be returned in any order we simply
    //       // provide the events that must be received in order to finish timing.
    //       return timings['me channel joined'] && timings['webrtc connected'];
    //     }
    //   });
    // }

    CallActions.connect(data);
  },

  disconnect: function() {
    console.log("Calls:disconnect");

    this.stopLocalStream();
    CallActions.localStream({stream: null});
    CallActions.disconnect();
  },

  meChannelJoined: function(data) {
    // Stopwatch.mark('me channel joined');

    // if (PreferencesStore.get('pause_music_during_calls')) {
    //   Music.pause();
    // }
    this.activateMedia();
  },

  meChannelLeft: function(data) {
    //TODO
    // var current_user = UsersStore.getCurrentUser();

    // if (PreferencesStore.get('pause_music_during_calls')) {
    //   Music.resume();
    // }
    // if (!current_user || !current_user.channel_id || data.id == current_user.channel_id) {
    //   this.disconnect();
    // }
  },

  meChannelKicked: function(data) {
    //TODO
    // this.meChannelLeft(data);
    // var kicker = UsersStore.get(data.kicker_id);
    // if(kicker) {
    //   AppActions.desktopNotification(
    //     "You were kicked!",
    //     "It looks like "+ kicker.first_name.capitalize() +" kicked you from the call, no hard feelings"
    //   );
    // }
  },

  startSpeaking: function() {
    // immediately increase mix volume to 100%
    this.microphoneGain.gain.value = 1;
  },

  stopSpeaking: function() {
    // slowly lower the mix volume over half a second
    if (PreferencesStore.get('ambient_noise_reduction')) {
      var context = MediaManager.getAudioContext();
      this.microphoneGain.gain.linearRampToValueAtTime(0.65, context.currentTime+0.5);
    }
  },

  dispatchAction: function(action, payload) {
    var callback = this.actions[action];

    if (callback) {
      if (this[callback]) {
        this[callback].call(this, payload);
      } else {
        throw new Error("Calls callback "+ callback +" does not exist for action " + action);
      }
    }
  }
};

module.exports = Calls;
