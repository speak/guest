var AppDispatcher = require('../dispatcher/app-dispatcher');

var OpentokActions = {
  auth: function(channel_id) {
    AppDispatcher.dispatch('channel.auth', {id: channel_id});
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

  permissionsDialog: function(value) {
    AppDispatcher.dispatch('webrtc.permissions', value);
  },
};

module.exports = OpentokActions;
