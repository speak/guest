var ChannelStore = require('../stores/channel-store');
var AppStore = require('../stores/app-store');
var _ = require('underscore');
var cache = {};

var Sound = {
  actions: {
    'channel.joined':    'channelJoined',
    'channel.left':      'channelLeft',
    'channel.kicked':    'channelLeft',
    'message.create':    'messageSent',
    'message.created':   'messageCreated'
  },

  sounds: [
    'channel-joined',
    'channel-left',
    'ping',
    'message-sent',
    'message-persisted',
    'message-received'
  ],

  /**
   * @channelJoined: Plays a sound when new users join a channel that we are in
   * or we successfully join a channel. 
   * -@data     Hash from channel.joined event including channel and user.
   */
  channelJoined: function(data) {
    if(AppStore.get('user_id') != data.user_id) {
      this.play('channel-joined');
    }
  },

  /**
   * @channelLeft: Plays a sound when users leave a channel that we are in, or 
   * we successfully leave the channel.
   * -@data     Hash from channel.left event including id and user_id
   */
  channelLeft: function(data) {
    if(AppStore.get('user_id') != data.user_id) {
      this.play('channel-left');
    }
  },
  
  messageSent: function() {
    this.play('message-sent');
  },

  messageCreated: function(data) {
    if(AppStore.get('user_id') == data.author_id) {
      this.play('message-persisted');
    } else {
      this.play('message-received');
    }
  },

  loadAll: function() {
    _.each(this.sounds, function(id){
      cache[id] = new Audio('/sounds/'+ id +'.ogg');
    });
  },

  play: function(id) {
    if (cache[id]) {
      cache[id].play();
    } else {
      throw "Sound not available";
    }
  },

  stop: function(id) {
    if (cache[id]) {
      cache[id].pause();
      cache[id].currentTime = 0;
    } else {
      throw "Sound not available";
    }
  },
  
  dispatchAction: function(action, payload) {
    var callback = this.actions[action];
    if (callback) {
      if (this[callback]) {
        this[callback].call(this, payload);
      } else {
        throw new Error("Sound callback "+ callback +" does not exist for action " + action);
      }
    }
  }
}

module.exports = Sound;
