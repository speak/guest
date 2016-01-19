var AppDispatcher = require('../dispatcher/app-dispatcher');
var ChannelStore = require('../stores/channel-store');
var AppStore = require('../stores/app-store');
var Utilities = require('../libs/utilities');
var Api = require('../libs/api');
var $ = require('jquery');

var UserActions = {
  mute: function(shortcut) {
    AppDispatcher.dispatch('audio.unpublish', {user_id: AppStore.get('user_id')});
  },

  unmute: function(shortcut) {
    AppDispatcher.dispatch('audio.publish', {user_id: AppStore.get('user_id')});
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
    return Api.put({
      endpoint: '/channels/' + ChannelStore.get('id'),
      data: data
    })
    .done(function(data){
      AppDispatcher.dispatch('channel.updated', data.channel);
    });
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
  
  channelUpdated: function(data) {
    AppDispatcher.dispatch('channel.updated', data);
  },

  channelCreate: function(data) {
    AppDispatcher.dispatch('channel.create', data);
  },

  channelLeave: function() {
    AppDispatcher.dispatch('channel.leave');
  },
  
  channelLock: function(data) {
    return Api.post({
      endpoint: '/channels/'+ ChannelStore.get('id') +'/lock',
      data: data
    }).done(function(data){
      AppDispatcher.dispatch('channel.updated', {
        locked: true
      });
    })
  },
  
  channelUnlock: function(data) {
    return Api.post({
      endpoint: '/channels/'+ ChannelStore.get('id') +'/unlock',
      data: data
    }).done(function(data){
      AppDispatcher.dispatch('channel.updated', {
        locked: false
      });
    })
  },
  
  sendMessage: function(text, channel) {
    var id = Utilities.guid();
    var data = {
      id: id,
      text: text,
      user_id: AppStore.get('user_id')
    };
      
    AppDispatcher.dispatch('message.create', data);
    Api.post({
      endpoint: '/channels/'+ channel.id +'/messages',
      data: data
    }).done(function(data){
      AppDispatcher.dispatch('message.persisted', {
        id: id,
        server_id: data.message.id
      });
      AppDispatcher.dispatch('message.created', data.message);
    }).fail(function(){
      // TODO
    });
  },

  updateMessage: function(data) {
    // TODO
  }
};

window.UserActions = UserActions;

module.exports = UserActions;
