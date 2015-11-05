var AppDispatcher = require('../dispatcher/app-dispatcher');
var AppActions = require('../actions/app-actions');
var _ = require('underscore');

var CallActions = {
  connect: function(data) {
    if(data.token) {
      AppDispatcher.dispatch('webrtc.connect', {
        server: data.server,
        channel_id: data.id,
        token: data.token
      });
    } else {
      AppDispatcher.dispatch('channel.auth', {
        id: data.id
      }, {
        success: function(response){
          AppDispatcher.dispatch('channel.updated', response);
          AppDispatcher.dispatch('webrtc.connect', {
            server: data.server,
            channel_id: data.id,
            token: response.token
          });
        }
      });
    }
  },
  
  permissionsDialog: function(value) {
    AppDispatcher.dispatch('webrtc.permissions', value);
  },
  
  disconnect: function(reconnect_okay) {
    AppDispatcher.dispatch('webrtc.disconnect', reconnect_okay);
  },

  userRing: function(data) {
    AppDispatcher.dispatch('user.ring', data);
  },

  channelAccept: function(data) {
    AppDispatcher.dispatch('channel.accept', data);
  },

  channelTimedout: function(data) {
    AppDispatcher.dispatch('channel.timedout', data);
  },

  channelLeave: function(channel) {
    AppDispatcher.dispatch('channel.leave', _.pick(channel, 'id'));
    AppDispatcher.dispatch('me.channel.left');
  },

  userUpdate: function(data) {
    AppDispatcher.dispatch('user.client_updated', data);
  },

  channelDefunct: function(data) {
    AppDispatcher.dispatch('channel.defunct', data);
  },

  startSpeaking: function() {
    var user = _.findWhere(AppDispatcher.getStore('usersStore'), {me: true});
    
    if (!user.muted) {
      AppDispatcher.dispatch('user.start_speaking');
    }
    
    // we don't get our own started/stopped events so need to trigger manually
    AppDispatcher.dispatch('user.started_speaking', {id: user.id});
    AppDispatcher.dispatch('me.user.started_speaking', {id: user.id});
  },
  
  stopSpeaking: function() {
    var user = _.findWhere(AppDispatcher.getStore('usersStore'), {me: true});
    
    if (!user.muted) {
      AppDispatcher.dispatch('user.stop_speaking');
    }
    
    // we don't get our own started/stopped events so need to trigger manually
    AppDispatcher.dispatch('user.stopped_speaking', {id: user.id});
    AppDispatcher.dispatch('me.user.stopped_speaking', {id: user.id});
  },
  
  localStream: function(data) {
    var stream = data && data.stream;
    AppDispatcher.dispatch('webrtc.stream.local', stream ? stream.id : null);
  },

  error: function(message) {
    AppDispatcher.dispatch('banner.error', message);
  }
}

module.exports = CallActions;
