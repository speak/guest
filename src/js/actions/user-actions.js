var AppDispatcher = require('../dispatcher/app-dispatcher');
var ChannelStore = require('../stores/channel-store');
var AppStore = require('../stores/app-store');

var UserActions = {
  publishVideo: function() {
    AppDispatcher.dispatch('video.publish', {
      user_id: AppStore.get('user_id'),
      channel_id: ChannelStore.get('id')
    });
  },

  unpublishVideo: function() {
    AppDispatcher.dispatch('video.unpublish', {
      user_id: AppStore.get('user_id'),
      channel_id: ChannelStore.get('id')
    });
  },

  publishScreen: function() {
    AppDispatcher.dispatch('screen.publish', {
      user_id: AppStore.get('user_id'),
      channel_id: ChannelStore.get('id')
    });
  },

  unpublishScreen: function() {
    AppDispatcher.dispatch('screen.unpublish', {
      user_id: AppStore.get('user_id'),
      channel_id: ChannelStore.get('id')
    });
  },

  channelToggleHighlight: function(user_id, type) {
    AppDispatcher.dispatch('channel.highlighted', {
      user_id: user_id,
      type: type
    });
  }
};

window.UserActions = UserActions;

module.exports = UserActions;