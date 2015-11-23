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
    "channel.created":                  "auth",
    "channel.authed":                   "connect",
    "signaling.video_session_started":  "connect",
    "signaling.video_token_generated":  "connect",
    "audio.publish":                    "publishAudio",
    "audio.unpublish":                  "unpublishAudio",
    "video.publish":                    "publishVideo",
    "video.unpublish":                  "unpublishVideo",
    "video.republish":                  "republishVideo",
    "screen.publish":                   "publishScreen",
    "screen.unpublish":                 "unpublishScreen",
    "session.destroy":                  "destroy",
    "session.error":                    "destroy"
  },
  
  initialize: function() {
    _.bindAll(this, 'streamCreated', 'streamDestroyed', 'streamPropertyChanged',
    'mediaStopped', 'sessionConnected', 'opentokException');
  },
  
  auth: function() {
    if (!ChannelStore.get('video_token')) {
      OpentokActions.auth(ChannelStore.get('id'));
    }
  },

  connect: function() {
    var sessionId = ChannelStore.get('video_session_id');
    var videoToken = ChannelStore.get('video_token');
    if (!sessionId || !videoToken) return;

    this.session = OT.initSession(Config.tokens.tokbox_api_key, sessionId);
    this.session.on({
      streamCreated: this.streamCreated,
      streamDestroyed: this.streamDestroyed,
      streamPropertyChanged: this.streamPropertyChanged,
      mediaStopped: this.mediaStopped,
      sessionConnected: this.sessionConnected,
      exception: this.opentokException
    });
    this.session.connect(videoToken);
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
    console.log(event);
  },

  streamCreated: function(event) {
    console.log('streamCreated', event);
    
    var domElement = document.createElement("div");
    var userId = event.stream.connection.data.replace("userId=", "");
    var subscriber = this.session.subscribe(event.stream, domElement, { showControls: false });
    
    subscriber.on('videoEnabled', function(){
      var action = event.stream.videoType == 'camera' ? "videoPublished" : "screenPublished";
      OpentokActions[action](userId);
    });
    subscriber.on('videoDisabled', function(){
      var action = event.stream.videoType == 'camera' ? "videoUnpublished" : "screenUnpublished";
      OpentokActions[action](userId);
    });

    this.setDOMElement(userId, event.stream.videoType, domElement);
  },
  
  mediaStopped: function(event) {
    console.log('mediaStopped', event);
    this.streamDestroyed(event);
  },

  streamDestroyed: function(event) {
    console.log('streamDestroyed', event);

    var userId = event.stream.connection.data.replace("userId=", "");
    var action = event.stream.videoType == 'camera' ? "videoUnpublished" : "screenUnpublished";
    this.setDOMElement(userId, event.stream.videoType, null);
    OpentokActions[action](userId);
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
        publishVideo: user.publishing_video === true,
        publishAudio: user.muted !== false,
        resolution: "1080x720",
        audioFallbackEnabled: true,
        frameRate: 30,
        showControls: false
      };

      MediaManager.getCurrentVideoSource(function(sourceId){
        // this cannot be set to null, otherwise OT assumes audio only session
        if (sourceId && user.publishing_video) options.videoSource = sourceId;
        
        console.log(options);
        
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
        name: 'Screen',
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
      this.setDOMElement(userId, 'screen', domElement);
      OpentokActions.screenPublished(userId, channelId);
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

Opentok.initialize();

OT.registerScreenSharingExtension('chrome', Utilities.getScreenshareExtensionId());

module.exports = Opentok;
