var Store =  require('./store');
var AppStore = require('./app-store');
var Config = require('config');
var _ = require('underscore');

var UsersStore = new Store({
  actions: {
    'user.configuration':     'userConfiguration',
    'user.started_speaking':  'userStartedSpeaking',
    'user.stopped_speaking':  'userStoppedSpeaking',
    'user.muted':             'muted',
    'user.unmuted':           'unmuted',
    'user.highlighted':       'userHighlighted',
    'channel.found':          'channelUpdated',
    'channel.created':        'channelUpdated',
    'channel.joined':         'channelJoined',
    'channel.left':           'channelLeft',
    'channel.kicked':         'channelLeft',
    'video.published':        'videoPublished',
    'video.unpublished':      'videoUnpublished',
    'screen.published':       'screenPublished',
    'screen.unpublished':     'screenUnpublished',
    'session.destroy':        'sessionDestroyed'
  },
  
  userConfiguration: function(data) {
    data.user.me = true;
    this.update(data.user);
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
    this.update(data.id, {muted: true});
  },
  
  unmuted: function(data) {
    this.update(data.id, {muted: false});
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
    data.user.online = true;
    this.update(data.user);
  },

  channelLeft: function(data){
    this.update(data.user_id, {
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
