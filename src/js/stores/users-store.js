var Flux = require('delorean').Flux;
var Config = require('config');
var _ = require('underscore');

var UsersStore = Flux.createStore({
  actions: {
    'channel.found': 'channelUpdated',
    'channel.created': 'channelUpdated',
    'channel.joined': 'channelJoined'
  },

  channelUpdated: function(data) {
    data.users.forEach(function(u){
      this.state[u.id] = u;
    }.bind(this));
    this.emit('change');
  },

  channelJoined: function(data){
    console.log("Channel Joined users store handler");
    console.log(data);
    this.state[data.user_id] = data.user;
    this.emit('change');
  },

  otherUsers: function(){
    return _.filter(this.state, function(u){ return u.me != true });
  }
});

module.exports = UsersStore;
