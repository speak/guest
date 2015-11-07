var AppStore = require("../stores/app-store");
var UsersStore = require("../stores/users-store");
var OpentokActions = require("../actions/opentok-actions");
var ChannelStore = require("../stores/channel-store");
var Config = require("config");
var _ = require("underscore");

var Opentok = {

  publishVideoOnConnect: false,
  publishScreenOnConnect: false,
  domElements: {},

  actions: {
    "signaling.video_session_started":  "maybeConnect",
    "signaling.video_token_generated":  "maybeConnect",
    "channel.joined":                   "maybeConnect",
    "video.publish":                    "publishVideo",
    "video.unpublish":                  "unpublishVideo",
    "screen.publish":                   "publishScreen",
    "screen.unpublish":                 "unpublishScreen",
    "app.request_video_stream":         "republishVideo",
    "session.destroy":                  "destroy",
    "session.error":                    "destroy",
    "webrtc.disconnected":              "destroy",
    "socks.disconnected":               "destroy"
  },

  maybeConnect: function() {
    var sessionId = ChannelStore.get('video_session_id');
    var videoToken = ChannelStore.get('video_token');
    
    if (sessionId && videoToken) {
      this.connect(sessionId, videoToken);
    }
  },

  connect: function(sessionId, videoToken) {
    console.log('connect', sessionId, videoToken);

    if (this.session) {
      if (this.session.id == sessionId) {
        console.log("Did not reconnect because existing session with id", sessionId);
        return;
      }
      
      // we have an existing session but it isn't the right one
      // so clean her up and connect to the correct one.
      this.session.off();
      this.session.disconnect();
    }

    this.session = OT.initSession(Config.tokens.tokbox_api_key, sessionId);
    this.session.on({
      streamCreated: this.streamCreated.bind(this),
      streamDestroyed: this.streamDestroyed.bind(this),
      sessionConnected: this.sessionConnected.bind(this),
      exception: this.opentokException.bind(this),
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

    // great, lets share our own streams first
    this.maybePublish();

    // and subscribe to anyone else that's publishing
    _.each(event.streams, function(stream) {
      this.streamCreated({ stream: stream });
    }.bind(this));
  },

  streamCreated: function(event) {
    console.log('streamCreated', event);
    
    var domElement = document.createElement("div");
    var userId = event.stream.connection.data.replace("userId=", "");
    var action = event.stream.videoType == 'camera' ? "videoPublished" : "screenPublished";
    
    var subscriber = this.session.subscribe(event.stream, domElement, { showControls: false });
    subscriber.on('videoEnabled', function(){
      console.log('videoEnabled');
    });
    subscriber.on('videoDisabled', function(){
      console.log('videoDisabled');
    });
    this.setDOMElement(userId, event.stream.videoType, domElement);
    
    var channelId = UsersStore.getCurrentUser().channel_id;
    OpentokActions[action](userId, channelId);
  },

  streamDestroyed: function(event) {
    console.log('streamDestroyed', event);

    var userId = event.stream.connection.data.replace("userId=", "");
    var action = event.stream.videoType == 'camera' ? "videoUnpublished" : "screenUnpublished";
    this.setDOMElement(userId, event.stream.videoType, null);

    var channelId = UsersStore.getCurrentUser().channel_id;
    OpentokActions[action](userId, channelId);
  },
  
  republishVideo: function() {
    var previouslyPublishing = !!this.cameraPublisher;
    this.unpublishVideo();
    
    if (previouslyPublishing) this.publishVideo();
  },

  publishVideo: function() {
    console.log('publishVideo');
    
    var user = UsersStore.getCurrentUser();
    var channelId = ChannelStore.get('id');
    
    if (this.session && this.session.currentState == "connected") {
      var domElement = document.createElement("div");
      var userId = AppStore.get('user_id');
      //var videoInput = PreferencesStore.get('video_input');
      var options = {
        insertMode: "append",
        publishAudio: false,
        publishVideo: true,
        resolution: "640x480",
        audioFallbackEnabled: false,
        frameRate: 30,
        showControls: false
      };

      //MediaManager.getCurrentVideoSource(function(sourceId){
        
        //if (sourceId) {
          // this cannot be set to null, otherwise OT assumes an audio only session
        //  options.videoSource = sourceId;
        //}
        
        this.cameraPublisher = OT.initPublisher(domElement, options);
        this.session.publish(this.cameraPublisher);
        this.setDOMElement(userId, 'camera', domElement);

        OpentokActions.videoPublished(userId, channelId);
        
        //}.bind(this));
      
    } else {
      this.publishVideoOnConnect = true;
    }
  },

  unpublishVideo: function(data) {
    console.log('unpublishVideo');
    
    this.publishVideoOnConnect = false;
    if (this.cameraPublisher) {
      this.cameraPublisher.destroy();
      this.cameraPublisher = null;
      
      var userId = AppStore.get('user_id');
      if(data && data.channel_id) {
        OpentokActions.videoUnpublished(userId, data.channel_id);
      } else {
        OpentokActions.videoUnpublished(userId);
      }
    }
  },

  publishScreen: function() {
    console.log('publishScreen');
    
    var user = UsersStore.getCurrentUser();
    var channelId = ChannelStore.get('id');
    var userId = AppStore.get('user_id');
    
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
        videoSource: "screen"
      });
      this.session.publish(this.screenPublisher);
      this.setDOMElement(userId, 'screen', domElement);
      OpentokActions.screenPublished(userId, channelId);
    } else {
      this.publishScreenOnConnect = true;
    }
  },

  unpublishScreen: function(data) {
    this.publishScreenOnConnect = false;
    
    var channelId = ChannelStore.get('id');
    var userId = AppStore.get('user_id');
    
    if (this.screenPublisher) {
      this.screenPublisher.destroy();
      this.screenPublisher = null;
      
      if(data && data.channel_id) {
        OpentokActions.screenUnpublished(userId, channelId);
      } else {
        OpentokActions.screenUnpublished(userId);
      }
    }
  },

  destroy: function() {
    this.unpublishVideo();
    this.unpublishScreen();
    
    if (this.session) {
      this.session.off();
      this.session.disconnect();
    }
    
    this.domElements = {};
    this.session = null;
  },

  maybePublish: function() {
    if (this.publishVideoOnConnect) {
      this.publishVideo();
    }

    if (this.publishScreenOnConnect) {
      this.publishScreen();
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

OT.registerScreenSharingExtension('chrome', 'kejgjfgcblcdakmblmecpljgiocdgkha');

module.exports = Opentok;
