var Store =  require('./store');
var UsersStore =  require('./users-store');
var _ = require('underscore');

var ChannelStore = new Store({
  actions: {
    'channel.found':              'reset',
    'channel.created':            'reset',
    'session.destroy':            'destroy',
    'channel.highlighted':        'channelToggleHighlight',
    'user.signedin':              'userSignedin',
    'socks.connected':            'socksConnected',
  },

  scheme: {
    id: null,
    name: null,
    public: null,
    public_url: null,
    server: null,
    temporary: null,
    token: null,
    users: [],
    video_session_id: null,
    path: null,
    requested_path: {
      calculate: function () {
        return window.location.pathname.split('/')[1];
      }
    }
  },

  destroy: function(data){
    window.history.pushState({}, "Speak", "/");
    this.state = {};
    this.emit('change');
  },

  reset: function(data){
    if(data.path) {
      window.history.pushState(data.id, "Speak", "/" + data.path);
    }
    this.state = data;
    this.emit('change');
  },

  userSignedin: function(data){
    if(data.channel_name) {
      this.state.name = data.channel_name;
      this.emit('change');
    }
  }, 

  socksConnected: function(){
    var AppActions =  require('../actions/app-actions');
    if(!this.state.id && !this.state.requested_path) {
      AppActions.createChannel({
        name:this.state.name
      });
    }
  },

  channelToggleHighlight: function(data){
    this.state.highlighted_user_id = data.user_id ? data.user_id : null;
    this.state.highlighted_type = data.type;
    this.emit('change');
  },
  
  getActiveSpeaker: function() {
    var channel_id = this.get('id');
    
    // user set a highlight - return that.
    if(this.get('highlighted_user_id')) return {id: this.get('highlighted_user_id'), type: this.get('highlighted_type')};

    // someone's screensharing - they're the winner.
    var screensharing = _.find(UsersStore.state, function(u){
      return u && !u.me && u.channel_id == channel_id && u.publishing_screen;
    });
    if(screensharing) return {id: screensharing.id, type: 'screen'};

    // Somebody's talking - now they win.
    if(this.get('active_speaker_id')) return {id: this.get('active_speaker_id'), type: 'video'};
    if(this.get('last_active_speaker_id')) return {id: this.get('last_active_speaker_id'), type: 'video'};

    // nobody's talking - anyone publishing video?
    var video = _.find(UsersStore.state, function(u) {
      return u && !u.me && u.channel_id == channel_id && u.publishing_video;
    });
    if(video) return {id: video.id, type: 'video'}

    // is there anyone else in this call at all?
    var notme = _.find(UsersStore.state, function(u) { return u && !u.me; });
    if(notme) return {id: notme.id, type: 'video'}

    // Wow - I'm alone.
    return null;
  },
});

module.exports = ChannelStore;
