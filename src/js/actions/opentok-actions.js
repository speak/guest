var AppDispatcher = require('../dispatcher/app-dispatcher');
var Api = require('../libs/api');

var OpentokActions = {
  auth: function(channel_id) {
    Api.get({
      endpoint: '/channels/' + channel_id + '/auth',
    })
    .done(function(data){
      AppDispatcher.dispatch('channel.authed', data.channel_auth);
    });
  },
  
  message: function(data) {
    AppDispatcher.dispatch('message.created', data);
  },
  
  sessionConnected: function() {
    AppDispatcher.dispatch('session.connected');
  },

  sessionDisconnected: function() {
    AppDispatcher.dispatch('session.disconnected');
  },

  sessionError: function(event) {
    AppDispatcher.dispatch('session.disconnected', {
      message: 'There was an issue connecting to the media server. Please try again. (Code ' + event.code+')'
    });
  },
  
  streamCreated: function(data) {
    data.online = true;
    AppDispatcher.dispatch('stream.created', data);
  },
  
  streamDestroyed: function(data) {
    AppDispatcher.dispatch('stream.destroyed', data);
  },
  
  audioPublished: function(user_id) {
    AppDispatcher.dispatch('audio.published', {user_id: user_id});
  },
  
  audioUnpublished: function(user_id) {
    AppDispatcher.dispatch('audio.unpublished', {user_id: user_id});
  },
    
  videoPublished: function(user_id) {
    AppDispatcher.dispatch('video.published', {user_id: user_id});
  },
  
  videoUnpublished: function(user_id) {
    AppDispatcher.dispatch('video.unpublished', {user_id: user_id});
  },
  
  screenPublished: function(user_id) {
    AppDispatcher.dispatch('screen.published', {user_id: user_id});
  },
  
  screenUnpublished: function(user_id) {
    AppDispatcher.dispatch('screen.unpublished', {user_id: user_id});
  },
  
  screenCancelled: function() {
    AppDispatcher.dispatch('screen.cancelled');
  },

  startedSpeaking: function(user_id) {
    AppDispatcher.dispatch('user.started_speaking', {id: user_id});
  },

  stoppedSpeaking: function(user_id) {
    AppDispatcher.dispatch('user.stopped_speaking', {id: user_id});
  },

  permissionsDialog: function(value) {
    AppDispatcher.dispatch('webrtc.permissions', value);
  },
};

module.exports = OpentokActions;
