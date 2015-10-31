var Flux = require('delorean').Flux;
var Config = require('config');
var _ = require('underscore');

var UsersStore = Flux.createStore({
  actions: {
    'channel.joined': 'channelJoined'
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
