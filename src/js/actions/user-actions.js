var AppDispatcher = require('../dispatcher/app-dispatcher');
var ChannelStore = require('../stores/channel-store');
var AppStore = require('../stores/app-store');
var Utilities = require('../libs/utilities');
var $ = require('jquery');

var UserActions = {
  mute: function(shortcut) {
    var data = {id: AppStore.get('user_id')}

    AppDispatcher.dispatch('user.stop_speaking');
    AppDispatcher.dispatch('user.mute', data, {
      error: function() {
        // catches unlikely errors and resets the UI
        AppDispatcher.dispatch('user.unmuted', data);
      }
    });

    // we send the past tense event locally so that the ui updates instantly
    AppDispatcher.dispatch('user.muted', data);
    AppDispatcher.dispatch('user.stopped_speaking', data);
  },

  unmute: function(shortcut) {
    var data = {id: AppStore.get('user_id')}

    AppDispatcher.dispatch('user.unmute', data, {
      error: function() {
        // catches unlikely errors and resets the UI
        AppDispatcher.dispatch('user.muted', data);
      }
    });

    // we send the past tense event locally so that the ui updates instantly
    AppDispatcher.dispatch('user.unmuted', data);
  },

  publishVideo: function() {
    AppDispatcher.dispatch('video.publish', {
      user_id: AppStore.get('user_id'),
      channel_id: ChannelStore.get('id')
    });
  },

  installScreenshareExtension: function(callback) {
    var extension = Utilities.getScreenshareExtensionUrl();
    // convert to node-style callback
    chrome.webstore.install(extension, function(){
      callback(null);
    }.bind(this), function(err){
      console.error(err);
      callback(err);
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
  },

  channelUpdate: function(data) {
    AppDispatcher.dispatch('channel.update', data);
  },
  
  editLastMessage: function() {
    AppDispatcher.dispatch('message.edit_last');
  },

  updateMessage: function(data) {
    AppDispatcher.dispatch('message.update', data);
  },
  
  typing: function(value) {
    AppDispatcher.dispatch('user.typing', value);
  },
  
  cancelEditing: function(id) {
    AppDispatcher.dispatch('message.updated', {
      id: id,
      editing: false
    });
  },

  sendMessage: function(text, channel_id) {
    var id = Utilities.guid();
    AppDispatcher.dispatch('message.create', {
      id: id,
      text: text,
      channel_id: channel_id
    }, {
      success: function(data){
        AppDispatcher.dispatch('message.persisted', {
          id: id,
          server_id: data.id
        });
      }
    });
  }
};

window.UserActions = UserActions;

module.exports = UserActions;
