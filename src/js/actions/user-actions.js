var AppDispatcher = require('../dispatcher/app-dispatcher');
var ChannelStore = require('../stores/channel-store');
var AppStore = require('../stores/app-store');
var Utilities = require('../libs/utilities');
var Api = require('../libs/api');
var $ = require('jquery');

var UserActions = {
  mute: function(shortcut) {
    AppDispatcher.dispatch('audio.unpublish', {user_id: AppStore.get('user_id')});
    
    /*var data = {id: AppStore.get('user_id')}

    AppDispatcher.dispatch('user.stop_speaking');
    AppDispatcher.dispatch('user.mute', data, {
      error: function() {
        // catches unlikely errors and resets the UI
        AppDispatcher.dispatch('user.unmuted', data);
      }
    });

    // we send the past tense event locally so that the ui updates instantly
    AppDispatcher.dispatch('user.muted', data);
    AppDispatcher.dispatch('user.stopped_speaking', data);*/
  },

  unmute: function(shortcut) {
    AppDispatcher.dispatch('audio.publish', {user_id: AppStore.get('user_id')});
    /*
    var data = {id: AppStore.get('user_id')}

    AppDispatcher.dispatch('user.unmute', data, {
      error: function() {
        // catches unlikely errors and resets the UI
        AppDispatcher.dispatch('user.muted', data);
      }
    });

    // we send the past tense event locally so that the ui updates instantly
    AppDispatcher.dispatch('user.unmuted', data);*/
  },

  publishVideo: function() {
    AppDispatcher.dispatch('video.publish', {user_id: AppStore.get('user_id')});
  },
  
  unpublishVideo: function() {
    AppDispatcher.dispatch('video.unpublish', {user_id: AppStore.get('user_id')});
  },

  publishScreen: function() {
    AppDispatcher.dispatch('screen.publish', {user_id: AppStore.get('user_id')});
  },

  unpublishScreen: function() {
    AppDispatcher.dispatch('screen.unpublish', {user_id: AppStore.get('user_id')});
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

  userHighlight: function(id, type) {
    AppDispatcher.dispatch('user.highlighted', {
      id: id,
      type: type
    });
  },

  channelUpdate: function(data) {
    AppDispatcher.dispatch('channel.update', data);
  },
  
  editLastMessage: function() {
    AppDispatcher.dispatch('message.edit_last');
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
  
  showModal: function(name) {
    AppDispatcher.dispatch('app.modal', name);
  },
  
  closeModal: function() {
    AppDispatcher.dispatch('app.modal');
  },

  channelCreate: function(data) {
    AppDispatcher.dispatch('channel.create', data);
  },

  channelLeave: function() {
    AppDispatcher.dispatch('channel.leave');
  },

  sendMessage: function(text, channel) {
    var id = Utilities.guid();
    var data = {
      id: id,
      text: text,
      token: channel.token,
      channel_id: channel.id,
      author_id: AppStore.get('user_id')
    };
      
    AppDispatcher.dispatch('message.create', data);
    Api.post({
      endpoint: '/messages',
      data: data
    }).done(function(data){
      AppDispatcher.dispatch('message.persisted', {
        id: id,
        server_id: data.id
      });
      AppDispatcher.dispatch('message.created', data);
    }).fail(function(){
      // TODO
    })
  },

  updateMessage: function(data) {
    AppDispatcher.dispatch('message.update', data);
  }
};

window.UserActions = UserActions;

module.exports = UserActions;
