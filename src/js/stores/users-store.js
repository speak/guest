var Flux = require('delorean').Flux;
var Config = require('config');
var _ = require('underscore');

var UsersStore = Flux.createStore({
  actions: {
    'channel.found':   'channelUpdated',
    'channel.created': 'channelUpdated',
    'channel.joined':  'channelJoined',
    'channel.left':    'channelLeft',
    'channel.kicked':  'channelLeft'
  },

  channelUpdated: function(data) {
    data.users.forEach(function(u){
      this.state[u.id] = u;
    }.bind(this));
    this.emit('change');
  },

  channelJoined: function(data){
    this.state[data.user_id] = data.user;
    this.emit('change');
  },

  channelLeft: function(data){
    delete this.state[data.user_id];
    this.emit('change');
  },

  otherUsers: function(){
    return _.filter(this.state, function(u){ return u.me != true });
  }
});

module.exports = UsersStore;
