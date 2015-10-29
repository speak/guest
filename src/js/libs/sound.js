var ChannelStore = require('../stores/channel-store');
var AppStore = require('../stores/app-store');
var paths = require('../../libs/paths');
var _ = require('underscore');
var cache = {};

var Sound = {
  actions: {
    'channel.joined':    'channelJoined',
    'channel.left':      'channelLeft',
    'channel.kicked':    'channelLeft',
    'user.ring':         'userRing',
    'user.disconnected': 'userDisconnected'
  },

  sounds: [
    'channel-joined',
    'channel-left',
    'ping'
  ],

  userDisconnected: function(data) {
    // if in our channel when disconnect, that's a channel leave
    var user = UsersStore.get(data.id);
    var current_user = UsersStore.getCurrentUser();
    
    if (user && user.channel_id && user.channel_id == current_user.channel_id) {
      this.play('channel-left');
    }
  },

  /**
   * @channelJoined: Plays a sound when new users join a channel that we are in
   * or we successfully join a channel. 
   * -@data     Hash from channel.joined event including channel and user.
   */
  channelJoined: function(data) {
    var current_user = UsersStore.getCurrentUser();
    var users_in_channel = _.filter(UsersStore.state, function(user) {
      return user.channel_id == data.id && !user.channel_state && user.online;
    });

    if (current_user.channel_id == data.id && users_in_channel.length >= 2) {
      this.stop('ping');
      this.play('channel-joined');
    }
  },

  /**
   * @channelLeft: Plays a sound when users leave a channel that we are in, or 
   * we successfully leave the channel. This method is also triggered from the 
   * user.kicked event.
   * -@data     Hash from channel.left event including id and user_id
   */
  channelLeft: function(data) {
    var channel = ChannelsStore.get(data.id);
    var current_user = UsersStore.getCurrentUser();
    var users_in_channel = _.filter(UsersStore.state, function(user) {
      return user.channel_id == data.id && !user.channel_state && user.online;
    });
    
    if (data.user_id == current_user.id || (data.id == current_user.channel_id && users_in_channel.length)) {
      if (channel && channel.started_at) this.play('channel-left'); 
    }
  },
  
  userRing: function(data) {
    var user = UsersStore.get(data.id);
    
    if (user && !user.ringing && user.online && AppStore.get('content') == 'app') {
      this.play('ping');
    }
  },

  loadAll: function() {
    _.each(this.sounds, function(id){
      cache[id] = new Audio(paths.sounds + '/'+ id +'.ogg');
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
