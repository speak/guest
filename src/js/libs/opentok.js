var AppStore = require('../stores/app-store');
var UsersStore = require('../stores/users-store');
var OpentokActions = require('../actions/opentok-actions');
var ChannelStore = require('../stores/channel-store');
var PreferencesStore = require('../stores/preferences-store');
var MediaManager = require('../libs/media-manager');
var Config = require('config');
var Utilities = require('./utilities');
var _ = require('underscore');

var Opentok = {
  domElements: {},

  actions: {
    "channel.found":                    "auth",
    "channel.updated":                  "auth",
    "channel.authed":                   "connect",
    "audio.publish":                    "publishAudio",
    "audio.unpublish":                  "unpublishAudio",
    "video.publish":                    "publishVideo",
    "video.unpublish":                  "unpublishVideo",
    "video.republish":                  "republishVideo",
    "screen.publish":                   "publishScreen",
    "screen.unpublish":                 "unpublishScreen",
    "message.created":                  "messageCreated",
    "message.updated":                  "messageUpdated",
    "channel.started_recording":        "startedRecording",
    "channel.stopped_recording":        "stoppedRecording",
    "session.destroy":                  "destroy",
    "session.error":                    "destroy"
  },
  
  initialize: function() {
    _.bindAll(this, 'streamCreated', 'streamDestroyed', 'streamPropertyChanged',
    'mediaStopped', 'sessionConnected', 'opentokException');
  },
  
  auth: function() {
    if (!ChannelStore.get('token') && (!ChannelStore.get('locked') || ChannelStore.get('password'))) {
      OpentokActions.auth(ChannelStore.get('id'), ChannelStore.get('password'));
    }
  },

  connect: function() {
    var sessionId = ChannelStore.get('p2p_session_id');
    var videoToken = ChannelStore.get('token');
    var userId = AppStore.get('user_id');
    if (!sessionId || !videoToken || !userId) return;

    this.session = OT.initSession(Config.tokens.tokbox_api_key, sessionId);
    this.session.on({
      signal: this.signal,
      streamCreated: this.streamCreated,
      streamDestroyed: this.streamDestroyed,
      streamPropertyChanged: this.streamPropertyChanged,
      mediaStopped: this.mediaStopped,
      sessionConnected: this.sessionConnected,
      exception: this.opentokException
    });
    this.session.connect(videoToken);
  },
  
  signal: function(event) {
    var user = JSON.parse(event.from.data);

    if (event.type === 'signal:message' && user.id != AppStore.get('user_id')) {
      OpentokActions.message(JSON.parse(event.data));
    }
  },

  opentokException: function(event) {
    OpentokActions.sessionError(event);
    this.unpublishVideo();
    this.unpublishScreen();
  },

  sessionConnected: function(event) {
    console.log('sessionConnected', event);
    OpentokActions.sessionConnected();
    
    // great, lets share our own streams first
    this.joinSession();

    // and subscribe to anyone else that's publishing
    _.each(event.streams, function(stream) {
      this.streamCreated({ stream: stream });
    }.bind(this));
  },
  
  sessionDisconnected: function(event) {
    // The event is defined by the SessionDisconnectEvent class
    if (event.reason == "networkDisconnected") {
      console.warn("Your network connection terminated.");
    }
  },
  
  streamPropertyChanged: function (event) {
    console.log('streamPropertyChanged');
    var user = JSON.parse(event.stream.connection.data);
    
    if (event.changedProperty === 'hasAudio') {
      if (event.newValue) {
        OpentokActions.audioPublished(user.id);
      } else {
        OpentokActions.audioUnpublished(user.id);
      }
    }
  },

  streamCreated: function(event) {
    console.log('streamCreated', event);
    
    var domElement = document.createElement("div");
    var user = JSON.parse(event.stream.connection.data);
    var subscriber = this.session.subscribe(event.stream, domElement, { showControls: false });
    OpentokActions.streamCreated(user);
    
    subscriber.on('videoEnabled', function(){
      var action = event.stream.videoType == 'camera' ? "videoPublished" : "screenPublished";
      OpentokActions[action](user.id);
    });
    subscriber.on('videoDisabled', function(){
      var action = event.stream.videoType == 'camera' ? "videoUnpublished" : "screenUnpublished";
      OpentokActions[action](user.id);
    });
    SpeakerDetection(subscriber, function() {
      OpentokActions.startedSpeaking(user.id);
    }, function() {
      OpentokActions.stoppedSpeaking(user.id);
    });

    this.setDOMElement(user.id, event.stream.videoType, domElement);
  },
  
  mediaStopped: function(event) {
    console.log('mediaStopped', event);
    this.streamDestroyed(event);
  },

  streamDestroyed: function(event) {
    console.log('streamDestroyed', event);

    var user = JSON.parse(event.stream.connection.data);
    OpentokActions.streamDestroyed(user);
    
    var action = event.stream.videoType == 'camera' ? "videoUnpublished" : "screenUnpublished";
    this.setDOMElement(user.id, event.stream.videoType, null);
    OpentokActions[action](user.id);
  },
  
  republishVideo: function() {
    if (this.cameraPublisher) {
      this.unpublish();
      this.publish();
    }
  },

  joinSession: function() {
    console.log('joinSession');
    var user = UsersStore.getCurrentUser();
    
    if (this.session && this.session.currentState == "connected") {
      var domElement = document.createElement("div");
      var options = {
        insertMode: "append",
        // === as undefined defaults to video being on
        publishVideo: user.publishing_video === true, 
        publishAudio: !user.muted,
        resolution: "1080x720",
        audioFallbackEnabled: true,
        showControls: false
      };

      MediaManager.getCurrentVideoSource(function(sourceId){
        // this cannot be set to null, otherwise OT assumes audio only session
        if (sourceId && user.publishing_video) options.videoSource = sourceId;

        this.cameraPublisher = OT.initPublisher(domElement, options);
        this.cameraPublisher.on('streamDestroyed', this.streamDestroyed);
        this.cameraPublisher.on('accessDialogOpened', this.accessDialogOpened);
        this.cameraPublisher.on('accessDialogClosed', this.accessDialogClosed);
        this.session.publish(this.cameraPublisher);
        this.setDOMElement(user.id, 'camera', domElement);
        
        if (user.publishing_video) {
          OpentokActions.videoPublished(user.id);
        } else {
          OpentokActions.audioPublished(user.id);
        }
      }.bind(this));
    }
  },
  
  accessDialogOpened: function() {
    console.log('accessDialogOpened');
    OpentokActions.permissionsDialog(true);
  },
  
  accessDialogClosed: function() {
    console.log('accessDialogClosed');
    OpentokActions.permissionsDialog(false);
  },

  publishAudio: function() {
    console.log('publishAudio');
    this.cameraPublisher.publishAudio(true);
    
    var user = UsersStore.getCurrentUser();
    OpentokActions.audioPublished(user.id);
  },

  unpublishAudio: function() {
    console.log('unpublishAudio');
    this.cameraPublisher.publishAudio(false);
    
    var user = UsersStore.getCurrentUser();
    OpentokActions.audioUnpublished(user.id);
  },

  publishVideo: function() {
    console.log('publishVideo');
    this.cameraPublisher.publishVideo(true);
    
    var user = UsersStore.getCurrentUser();
    OpentokActions.videoPublished(user.id);
  },

  unpublishVideo: function() {
    console.log('unpublishVideo');
    this.cameraPublisher.publishVideo(false);
    
    var user = UsersStore.getCurrentUser();
    OpentokActions.videoUnpublished(user.id);
  },

  publishScreen: function() {
    console.log('publishScreen');
    
    var user = UsersStore.getCurrentUser();
    
    if (this.session && this.session.currentState == "connected") {
      console.log('Session present. Publishing screen now.');
      var domElement = document.createElement("div");
      
      this.screenPublisher = OT.initPublisher(domElement, {
        insertMode: "append",
        maxResolution: {
          width: screen.availWidth,
          height: screen.availHeight
        },
        frameRate: 7,
        showControls: false,
        mirror: false,
        audioSource: null,
        videoSource: 'screen',
      }, function(err){
        if (err) { 
          console.error(err);
          OpentokActions.screenCancelled();
        }
      });
      this.screenPublisher.on('streamDestroyed', this.streamDestroyed);
      this.session.publish(this.screenPublisher);
      this.setDOMElement(user.id, 'screen', domElement);
      OpentokActions.screenPublished(user.id, channelId);
    } else {
      this.publishScreenOnConnect = true;
    }
  },

  unpublishScreen: function(data) {
    var user = UsersStore.getCurrentUser();
    
    if (this.screenPublisher) {
      this.screenPublisher.destroy();
      this.screenPublisher = null;
      OpentokActions.screenUnpublished(user.id);
    }
  },

  destroy: function() {
    if (this.session) {
      this.session.off();
      this.session.disconnect();
    }
    
    this.domElements = {};
    this.session = null;
  },
  
  messageCreated: function(message) {
    if (message.user_id == AppStore.get('user_id')) {
      this.session.signal({
        type: 'message',
        data: JSON.stringify(message)
      });
    }
  },
  
  messageUpdated: function(message) {
    if (message.user_id == AppStore.get('user_id')) {
      this.session.signal({
        type: 'message',
        data: JSON.stringify(message)
      });
    }
  },
  
  startedRecording: function(data) {
    if (data.created_by_id == AppStore.get('user_id')) {
      this.session.signal({
        type: 'channel.started_recording',
        data: data
      });
    }
  },
  
  stoppedRecording: function(data) {
    if (data.stopped_by_id == AppStore.get('user_id')) {
      this.session.signal({
        type: 'channel.stopped_recording',
        data: data
      });
    }
  },
  
  setDOMElement: function(user_id, type, element) {
    type = type || 'camera';
    this.domElements[user_id + type] = element;
  },
  
  getDOMElement: function(user_id, type) {
    type = type || 'camera';
    return this.domElements[user_id + type];
  },
  
  dispatchAction: function(action, payload) {
    var callback = this.actions[action];
    if (callback) {
      if (this[callback]) {
        this[callback].call(this, payload);
      } else {
        throw new Error("Opentok callback "+ callback +" does not exist for action " + action);
      }
    }
  }
};

// TEMP
var SpeakerDetection = function(subscriber, startTalking, stopTalking) {
  var activity = null;
  subscriber.on('audioLevelUpdated', function(event) {
    console.log('audioLevelUpdated', event);
    
    var now = Date.now();
    if (event.audioLevel > 0.2) {
      if (!activity) {
        activity = {timestamp: now, talking: false};
      } else if (activity.talking) {
        activity.timestamp = now;
      } else if (now- activity.timestamp > 1000) {
        // detected audio activity for more than 1s
        // for the first time.
        activity.talking = true;
        if (typeof(startTalking) === 'function') {
          startTalking();
        }
      }
    } else if (activity && now - activity.timestamp > 3000) {
      // detected low audio activity for more than 3s
      if (activity.talking) {
        if (typeof(stopTalking) === 'function') {
          stopTalking();
        }
      }
      activity = null;
    }
  });
};

Opentok.initialize();

OT.registerScreenSharingExtension('chrome', Utilities.getScreenshareExtensionId());

module.exports = Opentok;
