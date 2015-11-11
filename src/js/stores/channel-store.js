var Store =  require('./store');
var UsersStore =  require('./users-store');
var _ = require('underscore');

var ChannelStore = new Store({
  actions: {
    'user.started_speaking':            'userStartedSpeaking',
    'user.stopped_speaking':            'userStoppedSpeaking',
    'channel.found':                    'reset',
    'channel.created':                  'reset',
    'channel.not_found':                'channelNotFound',
    'channel.joined':                   'channelJoined',
    'channel.updated':                  'set',
    'channel.left':                     'clearActiveSpeaker',
    'channel.kicked':                   'clearActiveSpeaker',
    'video.unpublished':                'clearActiveSpeaker',
    'screen.unpublished':               'clearActiveSpeaker',
    'session.destroy':                  'destroy',
    'user.signedin':                    'userSignedin',
    'user.configuration':               'userConfiguration',
    'signaling.video_session_started':  'videoSessionStarted',
    'signaling.video_token_generated':  'videoTokenGenerated'
  },

  scheme: {
    id: null,
    name: null,
    public: null,
    public_url: null,
    server: null,
    temporary: null,
    token: null,
    video_token: null,
    video_session_id: null,
    active_speaker_id: null,
    last_active_speaker_id: null,
    created_by_id: null,
    started_at: null,
    not_found: false,
    path: null,
    requested_path: {
      calculate: function () {
        return window.location.pathname.split('/')[1];
      }
    }
  },

  channelNotFound: function(){
    this.set({
      not_found: true
    })
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
    this.set(data);
  },

  userSignedin: function(data){
    if(data.channel_name) {
      this.set({name: data.channel_name});
    }
  }, 

  userConfiguration: function(){
    var AppActions =  require('../actions/app-actions');
    if(this.state.not_found || (!this.state.id && !this.state.requested_path)) {
      var opts = {
        temporary: true,
        public: true
      }
      if(this.state.name){
        opts.name = this.state.name;
      }
      if(this.state.requested_path){
        opts.path = this.state.requested_path;
      }
      AppActions.createChannel(opts);
    }
  },
  
  channelJoined: function() {
    if (!this.get('started_at')) {
      this.set({started_at: (new Date()).getTime()});
    }
  },

  userStartedSpeaking: function(data){
    var user = UsersStore.get(data.id);
    if (user && !user.me && !this.get('active_speaker_id')) {
      this.set({active_speaker_id: user.id});
    }
  },

  userStoppedSpeaking: function(data){
    var user = UsersStore.get(data.id);
    if (user && !user.me && data.id == this.get('active_speaker_id')) {
      this.set({
        active_speaker_id: null,
        last_active_speaker_id: user.id,
      });
    }
  },

  clearActiveSpeaker: function(data) {
    var props = {};
    if (data.user_id == this.get('active_speaker_id')) {
      props.active_speaker_id = null;
    }
    if (data.user_id == this.get('last_active_speaker_id')) {
      props.last_active_speaker_id = null;
    }
    this.set(props);
  },
  
  getActiveSpeaker: function() {
    var channel_id = this.get('id');

    // user set a highlight - return that.
    var highlighted = UsersStore.getHighlightedUser();    
    if(highlighted) return {id: highlighted.id, type: highlighted.highlighted_type};

    // someone's screensharing - they're the winner.
    var screensharing = UsersStore.getScreensharingUser();
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

  videoSessionStarted: function(data) {
    this.set({video_session_id: data.video_session_id});
  },
  
  videoTokenGenerated: function(data) {
    this.set({video_token: data.video_token});
  }
});

module.exports = ChannelStore;
