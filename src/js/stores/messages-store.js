var Store = require('./store');
var AppStore = require('./app-store');
var UsersStore = require('./users-store');
var Utilities = require('../libs/utilities');

var MessagesStore = new Store({
  storeName: 'messages',
  lastMessageId: null,
  
  actions: {
    'message.create':      'messageCreate',
    'message.created':     'messageCreated',
    'message.updated':     'messageUpdated',
    'message.persisted':   'messagePersisted',
    'message.edit_last':   'messageEditLast',
    'channel.joined':      'channelJoined',
    'channel.left':        'channelLeft',
    'channel.locked':      'channelLocked',
    'channel.unlocked':    'channelUnlocked'
  },

  messageCreate: function(data){
    this.update(data);
  },
  
  messageCreated: function(data) {
    if (data.user_id != AppStore.get('user_id')) {
      data.persisted = true;
      data.created_at = (new Date()).getTime()
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
    message.created_at = (new Date()).getTime()
    
    this.lastMessageId = data.server_id;
    this.state[data.server_id] = message;
    this.emit('change');
  },
  
  messageEditLast: function() {
    if (this.lastMessageId) {
      this.update(this.lastMessageId, {editing: true});
    }
  },
  
  channelJoined: function(data) {
    if (data.user_id != AppStore.get('user_id')) {
      var id = Utilities.guid();
      this.update(id, {
        id: id,
        type: 'event',
        event: 'channel.joined',
        user_id: data.user_id,
        created_at: (new Date()).getTime()
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
          user_id: data.user_id,
          created_at: (new Date()).getTime()
        });
      }
    }
  },
  
  channelLocked: function(data) {
    var id = Utilities.guid();
    this.update(id, {
      id: id,
      type: 'event',
      event: 'channel.locked',
      user_id: data.user_id,
      created_at: (new Date()).getTime()
    });
  },
  
  channelUnlocked: function(data) {
    var id = Utilities.guid();
    this.update(id, {
      id: id,
      type: 'event',
      event: 'channel.unlocked',
      user_id: data.user_id,
      created_at: (new Date()).getTime()
    });
  }
});

module.exports = MessagesStore;