var Store =  require('./store');
var AppStore = require('./app-store');
var Config = require('config');
var _ = require('underscore');

var UsersStore = new Store({
  actions: {
    'user.created':           'userLoaded',
    'user.found':             'userLoaded',
    'user.started_speaking':  'userStartedSpeaking',
    'user.stopped_speaking':  'userStoppedSpeaking',
    'user.highlighted':       'userHighlighted',
    'user.updated':           'update',
    'channel.found':          'channelUpdated',
    'channel.created':        'channelUpdated',
    'channel.joined':         'channelJoined',
    'channel.left':           'channelLeft',
    'channel.kicked':         'channelLeft',
    'stream.destroyed':       'channelLeft',
    'stream.created':         'update',
    'audio.published':        'unmuted',
    'audio.unpublished':      'muted',
    'video.published':        'videoPublished',
    'video.unpublished':      'videoUnpublished',
    'screen.published':       'screenPublished',
    'screen.unpublished':     'screenUnpublished',
    'screen.cancelled':       'screenCancelled',
    'session.destroy':        'reset'
  },
  
  userLoaded: function(data) {
    data.me = true;
    data.online = true;
    this.update(data);
  },
  
  userStartedSpeaking: function(data) {
    this.update(data.id, {speaking: true});
  },
  
  userStoppedSpeaking: function(data) {
    this.update(data.id, {speaking: false});
  },
  
  userHighlighted: function(data) {
    var user = this.getHighlightedUser();
    if (user) {
      this.update(user.id, {highlighted: false});
    }
    
    if (data.id) {
      this.update(data.id, {
        highlighted: true,
        highlighted_type: data.type
      });
    }
  },
  
  muted: function(data) {
    this.update(data.user_id, {muted: true});
  },
  
  unmuted: function(data) {
    this.update(data.user_id, {muted: false});
  },

  reset: function(data) {
    this.state = {};
    this.emit("change")
  },

  channelUpdated: function(data) {
    _.each(data.users, function(user){
      this.update(user);
    }.bind(this));
  },

  channelJoined: function(data){
    data.user.online = true;
    this.update(data.user);
  },

  channelLeft: function(data){
    this.update(data.user_id || data.id, {
      online: false,
      speaking: false,
      highlighted: false,
      highlighted_type: null
    });
  },

  videoPublished: function(data) {
    this.update(data.user_id, {publishing_video: true});
  },

  videoUnpublished: function(data) {
    this.update(data.user_id, {publishing_video: false});
  },
  
  screenPublished: function(data) {
    this.update(data.user_id, {publishing_screen: true});
  },

  screenUnpublished: function(data) {
    var user = this.get(data.user_id);
    
    // if screen is highlighted and we unpublish then unselect
    if (user.highlighted && user.highlighted_type === 'screen') {
      this.update(data.user_id, {highlighted: false});
    }
    
    this.update(data.user_id, {publishing_screen: false});
  },

  screenCancelled: function() {
    var user = this.getCurrentUser()

    this.update(user.id, {publishing_screen: false});
  },
  
  getCurrentUser: function() {
    return _.find(this.state, function(user){ return user.me; });
  },
  
  getOnlineUsers: function() {
    return _.filter(this.state, function(user){ return user.online; });
  },
  
  getScreensharingUser: function() {
    return _.find(this.state, function(user){
      return !user.me && user.publishing_screen;
    });
  },
  
  getHighlightedUser: function() {
    return _.find(this.state, function(user){ return user.highlighted; });
  },

  otherUsers: function(){
    return _.filter(this.state, function(user){ return user.me != true && user.online; });
  }
});

module.exports = UsersStore;
