var CallActions = require('../actions/call-actions');
var ChannelStore = require('../stores/channel-store');
var AppStore = require('../stores/app-store');
var AppActions = require('../actions/app-actions');
// var Stopwatch = require('./stopwatch');
var WebRTC = require('./webrtc');
var MediaManager = require('./media-manager');
var hark = require('hark');
var _ = require('underscore');

var ringInterval = 2000;
var ringTimeout = 30000;

var Calls = {
  actions: {
    'user.configuration':        'userConfiguration',
    'user.mute':                 'muteLocalStream',
    'user.unmute':               'unmuteLocalStream',
    'user.start_speaking':       'startSpeaking',
    'user.stop_speaking':        'stopSpeaking',
    'session.destroy':           'disconnect',
    'session.error':             'disconnect',
    'socks.disconnected':        'disconnect',
    'user.disconnected':         'cleanupEmptyChannels',
    'app.request_audio_stream':  'requestStream',
    'me.channel.left':           'meChannelLeft',
    'me.channel.kicked':         'meChannelKicked',
    'me.channel.joined':         'meChannelJoined',
    'channel.leave':             'disconnect',
    'channel.left':              'deleteChannelIfEmpty',
    'channel.invite':            'channelInvite',
    'channel.invited':           'channelInvited',
    'channel.accept':            'connect',
    'channel.join':              'channelJoin',
    'channel.deleted':           'channelDeleted',
    'channel.defunct':           'channelDeleted',
    'channel.cancelled':         'channelCancelled',
    'channel.ignored':           'deleteChannelIfEmpty',
    'channel.timedout':          'channelTimedOut',
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
    var self = this;

    if (!this.local_stream || force) {

      console.log("HIT ME WITH YOUR MEDIA")
      navigator.webkitGetUserMedia(MediaManager.getAudioConstraints(), function(stream) {
        console.log("Calls:gotUserMedia")
        self.updateLocalStream(stream);
        CallActions.localStream({stream: stream});
      }, function(err) {
        throw err;
        CallActions.error("Could not access microphone");
      });
    }
  },

  shouldChangeCall: function(data) {
    var current_user = UsersStore.getCurrentUser();
    var sender = UsersStore.get(data.sender_id);

    if(!current_user.channel_id) {
      return false;
    }
    if(current_user.id == data.sender_id) {
      return false;
    }
    if(current_user.channel_state == 'pending' && sender.channel_state == 'pending' && current_user.channel_id == sender.channel_id) {
      return true;
    }
  },

  changeCall: function(data) {
    console.log('Calls:changeCall');
    this.reconnect_to = data;
    CallActions.disconnect(true);
  },

  webrtcDisconnected: function(data) {
    console.log('Calls:webrtcDisconnected');
    if(this.reconnect_to) {
      CallActions.connect(this.reconnect_to);
      this.reconnect_to = null;
    }
  },

  shouldAutoAnswer: function(data) {
    if (!UserStore.get('instant')) {
      return false;
    }

    var current_user = UsersStore.getCurrentUser();
    var idle = !!UserStore.get('last_idle_at');
    var callWhenIdle = PreferencesStore.get('call_when_idle');

    if (current_user.channel_id != data.id) {
      return false;
    }
    if (idle && callWhenIdle) {
      return false;
    }
    return true;
  },

  startRinging: function(data) {
    // if we were the sender of this invite then
    // set the channel id,
    // set the channel state on the other user,
    // and set their timeouts
    if (UserStore.get('id') == data.sender_id) {
      CallActions.userUpdate({
        id: data.user_id,
        timeout_call: setTimeout(function(){ CallActions.channelTimedout(data) }, ringTimeout),
        interval_ring: setInterval(function(){ CallActions.userRing({id: data.user_id}) }, ringInterval)
      });

      // if the user we are calling is in instant mode then skip the first ring
      // this means that if the connection takes a long time it will start
      // ringing after two seconds, but if completed normally no ringing heard.
      var user = UsersStore.get(data.user_id);
      if (user && !user.instant) {
        CallActions.userRing({id: data.user_id});
      }

    // if we didn't make the call then
    // set the channel id,
    // set the other user to 'incoming',
    // and set their timeouts
    } else {
      CallActions.userUpdate({
        id: data.sender_id,
        timeout_call: setTimeout(function(){ CallActions.channelTimedout(data) }, ringTimeout),
        interval_ring: setInterval(function(){ CallActions.userRing({id: data.sender_id}) }, ringInterval)
      });
      if(!UserStore.get('instant')) {
        CallActions.userRing({id: data.sender_id});
      }
    }
  },

  channelInvite: function(data) {
    var user = UsersStore.get(data.user_id)
    if(user && user.online && !user.manual_offline) {

      // start the timer from initiators side
      // Stopwatch.start({
      //   params: {
      //     initiator: true
      //   },
      //   stop: function(timings) {
      //     // as the events are async and can be returned in any order we simply
      //     // provide the events that must be received in order to finish timing.
      //     return timings['me channel joined'] && timings['webrtc connected'];
      //   }
      // });

      this.startRinging(data)
    }
  },

  channelInvited: function(data) {
    // this is an offline invite, no need to go any further
    if(!data.id) return;

    // if (Stopwatch.isRunning()) {
    //   Stopwatch.mark('channel invited', {
    //     channel_id: data.id,
    //     server: data.server
    //   });
    // }

    if(this.shouldChangeCall(data)) {
      this.changeCall(data);
      return;
    }

    var autoAnswer = this.shouldAutoAnswer(data);
    var initiator = data.sender_id == UserStore.get('id');

    // we started the call or are in auto-answer mode then immediately kick off
    // the webrtc connection
    if (initiator) {
      this.connect(data);
    } else if (autoAnswer) {
      CallActions.channelAccept(data);
    }

    // we didn't start the call and are not auto answering so
    // make the client start ringing
    if (!initiator && !autoAnswer) {
      this.startRinging(data);
    }

    // we started the call, which means the
    // current timeout has the wrong channel_id.
    // Clear that timeout and make a new one.
    if(initiator) {
      CallActions.userUpdate({
        id: data.user_id,
        timeout_call: setTimeout(function(){ CallActions.channelTimedout(data) }, ringTimeout)
      });
    }
  },

  channelJoin: function(data) {
    this.connect(data);
  },

  channelDeleted: function(data) {
    var current_user = UsersStore.getCurrentUser();

    if(data.id == current_user.channel_id) {
      CallActions.channelLeave({id: data.id});
    }
  },

  channelCancelled: function(data) {
    var usersInChannel = UsersStore.getChannelUsers(data.id);

    if (usersInChannel.length <= 1) {
      this.meChannelLeft(data);
      this.deleteChannelIfEmpty(data);
    }
  },

  channelTimedOut: function(data) {
    var usersInChannel = UsersStore.getChannelUsers(data.id);

    if (usersInChannel.length <= 1) {
      this.meChannelLeft(data);
      this.deleteChannelIfEmpty(data);
    }
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
    var current_user = UsersStore.getCurrentUser();

    if (PreferencesStore.get('pause_music_during_calls')) {
      Music.resume();
    }
    if (!current_user || !current_user.channel_id || data.id == current_user.channel_id) {
      this.disconnect();
    }
  },

  meChannelKicked: function(data) {
    this.meChannelLeft(data);
    var kicker = UsersStore.get(data.kicker_id);
    if(kicker) {
      AppActions.desktopNotification(
        "You were kicked!",
        "It looks like "+ kicker.first_name.capitalize() +" kicked you from the call, no hard feelings"
      );
    }
  },

  cleanupEmptyChannels: function(data) {
    _.each(ChannelsStore.state, function(channel){
      if (channel) this.deleteChannelIfEmpty(channel);
    }.bind(this));
  },

  deleteChannelIfEmpty: function(data) {
    var usersInChannel = UsersStore.getChannelUsers(data.id);

    if (usersInChannel.length < 2) {
      CallActions.channelDefunct(data)
    }
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
