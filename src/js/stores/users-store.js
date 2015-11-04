var Store =  require('./store');
var AppStore = require('./app-store');
var Config = require('config');
var _ = require('underscore');

var UsersStore = new Store({
  actions: {
    'user.configuration': 'userConfiguration',
    'channel.found':      'channelUpdated',
    'channel.created':    'channelUpdated',
    'channel.joined':     'channelJoined',
    'channel.left':       'channelLeft',
    'channel.kicked':     'channelLeft',
    'session.destroy':    'sessionDestroyed'
  },
  
  userConfiguration: function(data) {
    data.user.me = true;
    this.update(data.user);
  },

  sessionDestroyed: function(data) {
    this.state = {};
    this.emit("change")
  },

  channelUpdated: function(data) {
    _.each(data.users, function(user){
      this.update(user);
    }.bind(this));
  },

  channelJoined: function(data){
    this.update(data.user);
  },

  channelLeft: function(data){
    delete this.state[data.user_id];
    this.emit('change');
  },
  
  getCurrentUser: function() {
    return _.find(this.state, function(user){ return user.me; });
  },

  otherUsers: function(){
    return _.filter(this.state, function(user){ return user.me != true });
  }
});

module.exports = UsersStore;
