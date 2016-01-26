var Store = require('./store');
var AppStore = require('./app-store');
var UsersStore = require('./users-store');
var Utilities = require('../libs/utilities');

var ChatStore = new Store({
  storeName: 'chat',
  lastMessageId: null,
  
  actions: {
    'message.create':             'messageCreate',
    'message.created':            'messageCreated',
    'message.updated':            'messageUpdated',
    'message.persisted':          'messagePersisted',
    'message.edit_last':          'messageEditLast',
    'channel.started_recording':  'startedRecording',
    'channel.stopped_recording':  'stoppedRecording',
    'channel.joined':             'channelJoined',
    'channel.left':               'channelLeft'
  },

  messageCreate: function(data){
    this.update(data);
  },
  
  messageCreated: function(data) {
    if (data.user_id != AppStore.get('user_id')) {
      data.persisted = true;
      this.update(data);
    }
  },

  messageUpdated: function(data){
    data.editing = false;
    this.update(data);
  },
  
  messagePersisted: function(data){
    var message = this.get(data.id);
    delete this.state[data.id];

    message.id = data.server_id;
    message.persisted = true;
    
    this.lastMessageId = data.server_id;
    this.state[data.server_id] = message;
    this.emit('change');
  },
  
  messageEditLast: function() {
    if (this.lastMessageId) {
      this.update(this.lastMessageId, {editing: true});
    }
  },
  
  startedRecording: function(data) {
    var id = Utilities.guid()
    this.update(id, {
      type: 'event',
      id: id,
      event: 'channel.started_recording',
      user: {id: data.user_id}
    });
  },

  stoppedRecording: function(data) {
    var id = Utilities.guid()
    this.update(id, {
      type: 'event',
      event: 'channel.stopped_recording',
      user: {id: data.user_id}
    });
  },

  channelJoined: function(data) {
    if (data.user_id != AppStore.get('user_id')) {
      var id = Utilities.guid();
      this.update(id, {
        id: id,
        type: 'event',
        event: 'channel.joined',
        user: {id: data.user_id}
      });
    }
  },
  
  channelLeft: function(data) {
    if (data.user_id != AppStore.get('user_id')) {
      var id = Utilities.guid();
      var user = UsersStore.get(data.user_id);
    
      if (user && user.online) {
        this.update(id, {
          id: id,
          type: 'event',
          event: 'channel.left',
          user: {id: data.user_id}
        });
      }
    }
  }
});

module.exports = ChatStore;
