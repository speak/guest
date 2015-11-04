var AppDispatcher = require('../dispatcher/app-dispatcher');

var OpentokActions = {
  sessionError: function(event) {
    AppDispatcher.dispatch("video.session_error", {
      message: 'There was an issue connecting to the media server. Please try again. (Code ' + event.code+')'
    });
  },
  
  videoPublished: function(user_id, channel_id) {
    AppDispatcher.dispatch('video.published', {user_id: user_id, channel_id: channel_id});
  },
  
  videoUnpublished: function(user_id, channel_id) {
    AppDispatcher.dispatch('video.unpublished', {user_id: user_id, channel_id: channel_id});
  },
  
  screenPublished: function(user_id, channel_id) {
    AppDispatcher.dispatch('screen.published', {user_id: user_id, channel_id: channel_id});
  },
  
  screenUnpublished: function(user_id, channel_id) {
    AppDispatcher.dispatch('screen.unpublished', {user_id: user_id, channel_id: channel_id});
  }
};

module.exports = OpentokActions;