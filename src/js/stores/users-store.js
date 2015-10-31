var Store =  require('./store');
var UserStore = require('./user-store');
var Config = require('../../config');
var moment = require('moment');
var Fuse = require('fuse.js');
var _ = require('underscore');

var UsersStore = new Store({
  storeName: 'users',
  
  actions: {
    'session.destroy':        'sessionDestroy',
    'user.configuration':     'reset',
    'organization.created':   'organizationCreated',
    'organization.left':      'organizationLeft',
    'organization.kicked':    'organizationLeft',
    'organization.joined':    'organizationJoined',
    'user.mute':              'mute',
    'user.unmute':            'unmute',
    'user.started_speaking':  'userStartedSpeaking',
    'user.stopped_speaking':  'userStoppedSpeaking',
    'user.activate':          'userActivated',
    'user.deleted':           'userDeleted',
    'user.ring':              'userRing',
    'channel.accept':         'channelAccept',
    'channel.join':           'channelJoin',
    'channel.invite':         'channelInvite',
    'channel.invited':        'channelInvited',
    'channel.ignored':        'clearPendingUsers',
    'channel.timedout':       'channelTimedOut',
    'channel.cancelled':      'channelTimedOut',
    'channel.joined':         'channelJoined',
    'channel.left':           'channelLeft',
    'webrtc.disconnected':    'webrtcDisconnected',
    'channel.kicked':         'channelLeft',
    'channel.deleted':        'channelDeleted',
    'channel.defunct':        'channelDeleted',
    'video.published':        'videoPublished',
    'video.unpublished':      'videoUnpublished',
    'screen.published':       'screenPublished',
    'screen.unpublished':     'screenUnpublished',
    'session.destroy':        'clearAllTimeouts'
  },
  
  reset: function(data) {
    var props = {};

    // normalize
    _.each(data.organizations, function(organization){
      _.each(organization.users, function(user){
        var me = (user.id == data.user.id);
        if (me) {
          user.online = true;
          user.me = true;
        }
        
        user.organizations = props[user.id] ? props[user.id].organizations : [];
        user.organizations.push(organization.id);
        props[user.id] = user;
      });
    });

    // NOTE: this is only needed on user.create
    // Before you take this out, try signing up.
    data.user.me = true;
    data.user.online = true;
    data.user.organizations = _.map(data.organizations, function(o){ return o.id; });
    props[data.user.id] = data.user;

    this.state = props;
    this.emit('change');
  },

  sessionDestroy: function(){
    this.clearAllTimeouts();
    this.clearState();
  },

  organizationCreated: function(data) {
    var user = this.getCurrentUser();
    this.push(user.id, 'organizations', data.id);
  },

  organizationLeft: function(data) {
    // if we left remove the organization from everyone else
    // note: we just remove the org link, not the user itself as users without
    // orgs will be filtered and may be needed in the store for ongoing calls
    if (data.user_id == UserStore.get('id')) {
      _.each(this.state, function(user, index){
        user.organizations = _.without(user.organizations, data.id);
        
        // If they have no organizations left and aren't in a channel then we
        // can safely remove them from the store
        if (!user.organizations.length && !user.channel_id) {
          delete this.state[index];
        }
      }.bind(this));
      this.emit('change');

    // if someone else left just remove the org from the single user
    } else {
      var user = this.get(data.user_id);
      var current_user = this.getCurrentUser();
      
      if(user && current_user){
        var intersection = _.intersection(user.organizations, current_user.organizations);
        var last_organization = !user.organizations || intersection.length === 1 && intersection[0] === data.id ;
        if(last_organization && !user.channel_id){
          this.userDeleted(user);
        } else {
          this.update(data.user_id, {organizations: _.without(user.organizations, data.id)});
        }
      } else {
        this.userDeleted(user);
      }
    }
  },

  organizationJoined: function(data) {
    if (data.user && data.organization) {
      this.update(data.user.id, data.user)
      this.push(data.user.id, 'organizations', data.organization.id);

      _.each(data.organization.users, function(user){
        this.update(user);
        this.push(user.id, 'organizations', data.organization.id);
      }.bind(this));
    }
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
    this.update(data.user_id, {publishing_screen: false});
  },
  
  userSignedin: function(data) {
    this.state[data.id] = data;
  },

  userConnected: function(data) {
    this.update(data.id, _.extend(data, {
      last_connected_at: moment().format(),
      channel_id: null,
      channel_state: null,
      online: true,
      publishing_video: false, 
      publishing_screen: false
    }));
  },

  userActivated: function(data) {
    this.update(data, {
      missed_calls: null
    });
  },
  
  userDisconnected: function(data) {
    var user = this.get(data.id);
    if (!user) return;
    
    this.stopRinging(user);
    this.update(data.id, {
      last_disconnected_at: moment().format(),
      channel_state: null,
      channel_id: null,
      online: false
    });
  },
  
  userStartedSpeaking: function(data) {
    this.update(data.id, {speaking: true});
  },
  
  userStoppedSpeaking: function(data) {
    this.update(data.id, {speaking: false});
  },

  userUpdated: function(data) {
    delete data.channel_id;
    this.update(data);
  },
  
  userCreated: function(data) {
    this.state[data.id] = data;
    this.emit('change');
  },

  userClientUpdated: function(data) {
    var user = this.get(data.id);
    
    // if we're receiving new timeouts, clear the old ones
    if (data.timeout_call) clearTimeout(user.timeout_call);
    if (data.interval_ring) clearTimeout(user.interval_ring);
    
    this.update(data);
  },
  
  userDeleted: function(data) {
    delete this.state[data.id];
    this.emit('change');
  },
  
  userRing: function(data) {
    var user = this.get(data.id);
    if (user) this.update(user.id, {ringing: !user.ringing});
  },
  
  userStarred: function(data) {
    this.update(data.id, {starred: true});
  },
  
  userUnstarred: function(data) {
    this.update(data.id, {starred: false});
  },
  
  
  mute: function(data) {
    this.update(data.id, {muted: true});
  },
  
  unmute: function(data) {
    this.update(data.id, {muted: false});
  },
  
  channelAccept: function(data) {
    // as we send this channel accept put ourselves in the channel with a status
    // of accepted until we get a successful connection
    var current_user = this.getCurrentUser();
    var users_in_channel = this.where({channel_id: data.id});
    
    users_in_channel.forEach(function(user){
      this.update(user.id, {missed_calls: 0});
    }.bind(this));
    
    this.update(current_user.id, {channel_id: data.id, channel_state: 'accepted'});
  },

  channelJoin: function(data) {
    // as we send this channel join put ourselves in the channel with a status
    // of pending until we get a successful connection
    var user = this.getCurrentUser();
    this.update(user.id, {channel_id: data.id, channel_state: 'pending'});
  },

  channelInvite: function(data) {
    // as we send this channel invite  put both in the temporary
    // channel so they are grouped in the UI.
    var me = this.getCurrentUser();
    var user = this.get(data.user_id);
    
    if (user.online && !user.manual_offline) {
      if(me.channel_id && me.channel_id != 'pending') {
        this.update(data.user_id, {channel_id: me.channel_id, channel_state: 'pending'});
      } else {
        this.update(data.user_id, {channel_id: 'pending', channel_state: 'pending'});
        this.update(data.sender_id, {channel_id: 'pending', channel_state: 'pending'});
      }
    }
  },
  
  channelInvited: function(data) {
    // offline invite
    if (!data.id) {
      var sender = this.get(data.sender_id);
      var props = {
        channel_state: null
      };
      
      // an offline invite can be sent during an ongoing call, this stops the 
      // call from being dismantled
      if (sender.channel_id == 'pending') {
        props['channel_id'] = null;
      }
      
      this.update(data.sender_id, props);
      return;
    }
    
    // if the channel invite includes a bunch of users lets mix them into 
    // the people we know
    if (data.users) {
      _.each(data.users, function(user){
        this.update(user);
      }.bind(this));
    }
    
    // we are calling the other user
    if (UserStore.get('id') == data.sender_id) {
      this.update(data.user_id, {
        channel_id: data.id, 
        channel_state: 'calling'
      });

      this.update(data.sender_id, {
        channel_id: data.id, 
        channel_state: null
      });
    // we're being called, lucky us.
    } else {
      // If we're currently calling the person calling us,
      // we need to switch calls.
      var user = this.get(data.user_id);
      var sender = this.get(data.sender_id);
      var users = this.getChannelUsers(data.id)
      if(sender.channel_state == "calling" && users.length < 3) {
        console.log('USERS STORE: CHANGE THE CALL')
        this.stopRinging(user);
        this.stopRinging(sender);
        this.update(data.sender_id, {
          channel_id: data.id,
          channel_state: 'pending'
        });
        this.update(data.user_id, {
          channel_id: data.id,
          channel_state: 'pending'
        });
      } else {
        // otherwise, proceed as normal
        this.update(data.sender_id, {
          channel_id: data.id,
          channel_state: 'incoming',
        });
        
        // put ourselves in incoming state unless already in a channel
        if (!this.get(data.user_id).channel_id) {
          this.update(data.user_id, {
            channel_id: data.id,
            channel_state: 'pending'
          });
        }
      }
    }
  },

  channelTimedOut: function(data) {
    this.clearPendingUsers(data);
    
    if (data.sender_id && UserStore.get('id') != data.sender_id) {
      var user = this.get(data.sender_id);
      if(user) {
        if(user.missed_calls) {
          user.missed_calls = user.missed_calls + 1;
        } else {
          user.missed_calls = 1;
        }
      }
      this.update(user);
    }
  },

  stopRinging: function(user) {
    if (!user) return;

    clearTimeout(user.timeout_call);
    clearInterval(user.interval_ring);

    this.update(user.id, {
      timeout_call: null,
      interval_ring: null,
      ringing: false
    });
  },

  clearPendingUsers: function(data) {
    // When this function is reacting to a server
    // event, data.id will be a BSON ChannelID.
    // When it is reacting to a client event (channel.invite)
    // then the id will be "pending", which is the channel
    // id used before the server returns 'channel.invited'
    var usersInChannel = this.where({channel_id: data.id});

    _.each(usersInChannel, function(user) {
      this.stopRinging(user);
      
      var calling = user.channel_state == 'calling';
      var incoming = user.channel_state == 'incoming';
      
      if (usersInChannel.length > 2 && incoming) {
        this.update(user.id, {
          channel_state: null
        });
      } else if(user.channel_state) {
        this.update(user.id, {
          channel_id: null, 
          channel_state: null, 
          speaking: false,
          publishing_video: false, 
          publishing_screen: false
        });
      }
    }.bind(this));
  },

  channelDeleted: function(data) {
    var usersInChannel = this.where({channel_id: data.id});
    _.each(usersInChannel, function(user) {
      this.stopRinging(user);
      this.update(user.id, {
        channel_id: null, 
        channel_state: null, 
        speaking: false,
        publishing_video: false, 
        publishing_screen: false
      });
    }.bind(this));
  },

  channelJoined: function(data) {
    var user = this.get(data.user.id);
    var channel_state = null;
    
    // if the user isnt already known to us then mix in the data from the event
    if (!user) {
      user = this.update(data.user);
    }
    
    var current_user = this.getCurrentUser();

    // if the user is calling us then we need to keep them in incoming state 
    // and ringing until we join the channel too
    if (user.channel_state == "incoming" && current_user.channel_state) {
      channel_state = "incoming";
    } else {
      this.stopRinging(user);
    }

    // if we are joining a multiparty call then find anyone in here that's
    // ringing us and stop them
    if (user.me) {
      var incoming_channel_users = this.where({channel_id: data.id, channel_state: "incoming"});

      _.each(incoming_channel_users, function(user) {
        // updating directly so that we only emit a single change event
        this.state[user.id].channel_state = null; 
        this.stopRinging(user);
      }.bind(this));
    }

    // if the channel includes a bunch of users lets mix them into 
    // the people we know
    if (data.channel && data.channel.users) {
      _.each(data.channel.users, function(user){
        this.update(user);
      }.bind(this));
    }

    this.update(data.user.id, {
      channel_id: data.id, 
      channel_state: channel_state,
      publishing_video: false,
      publishing_screen: false,
      speaking: false,
      online: true,
      muted: false
    });
  },

  channelLeft: function(data) {
    var user = this.get(data.user_id);
    if (!user) return;

    var shouldRemove = !user.me && (
      !user.organizations || 
      user.organizations.length <= 0 || 
      _.intersection(user.organizations, this.getCurrentUser().organizations).length === 0
    )
    this.stopRinging(user);

    if(shouldRemove) {
      delete this.state[data.user_id];
      this.emit('change');
    } else {
      this.update(data.user_id, {
        channel_id: null, 
        channel_state: null, 
        speaking: false,
        publishing_video: false, 
        publishing_screen: false,
        muted: null
      });
    }
  },

  webrtcDisconnected: function(data) {
    var user = this.getCurrentUser();
    if(data.channel_id == user.channel_id) {
      this.channelLeft({
        user_id: user.id,
        id: user.channel_id
      })
    }
  },

  getCurrentUser: function() {
    return _.findWhere(this.state, {me: true});
  },
  
  getStarredUsers: function() {
    var users = _.where(this.state, {starred: true});
    var now = new Date().getTime();
    
    return _.sortBy(users, function(user){
      
      // always put self at the top
      if (user.me) return 0;
      
      // online get ordered by last_connected_at
      if (user.online && !user.manual_offline) {
        return new Date(user.last_connected_at).getTime();
      
      // offline users get forced to the bottom
      } else {
        var latest = new Date(user.last_connected_at).getTime();
        return now + (now-latest);
      }
    }); 
  },

  getOrganizationUsers: function(id) {
    return _.filter(this.state, function(item){
      return item.organizations && item.organizations.indexOf(id) >= 0;
    });
  },
  
  getOrderedUsers: function(filters) {
    filters = filters || {};
    var order = {};
    var users = _.compact(this.state);

    // viewing a specific org
    users = _.filter(users, function(item){
      if (filters.organization_id) {
        return item.organizations && item.organizations.indexOf(filters.organization_id) >= 0;
      } else {
        return item.organizations;
      }
    });

    // fuse allows us to have an easy fuzzy search across multiple keys
    if (filters.search) {
      _.each(users, function(user){
        user.full_name = user.first_name + " " + user.last_name;
      });

      var f = new Fuse(users, {
        threshold: 0.0,
        keys: ['full_name', 'last_name', 'email']
      });
      users = f.search(filters.search);
    }

    // first pass orders users by last online
    var current_user = this.getCurrentUser();
    var now = new Date().getTime();
    
    return _.sortBy(users, function(user){
      var online = user.online && !user.manual_offline ? 1 : 0;
      var time = new Date(user.last_connected_at).getTime();
      
      if (user.me) return -now;
      if (user.starred && online) return -time;
      if (user.starred) return time;
      if (online) return now + time;
      
      // offline users get forced to the bottom
      return now + now + (now-time);
    });
  },
  
  getChannelUsers: function(id) {
    var users = _.filter(this.state, function(user){
      return user.channel_id == id && user.online;
    });
    
    return _.sortBy(users, function(user){
      if (user.me) return 0;
      return new Date(user.last_connected_at).getTime();
    });
  },

  getTotalMissedCallsCount: function() {
    return _.reduce(_.filter(this.state, function(u){
      return !!u.missed_calls;
    }), function(memo, u) { return memo + u.missed_calls }, 0);
  },

  clearAllTimeouts: function() {
    _.each(this.state, function(user) {
      this.stopRinging(user);
    }.bind(this));
  }
});

module.exports = UsersStore;
