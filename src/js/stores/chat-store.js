var Store = require('./store');
var AppStore = require('./app-store');

var ChatStore = new Store({
  storeName: 'chat',
  lastMessageId: null,
  
  actions: {
    'message.create':      'messageCreate',
    'message.created':     'messageCreated',
    'message.updated':     'messageUpdated',
    'message.persisted':   'messagePersisted',
    'message.edit_last':   'messageEditLast'
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
  }
});

module.exports = ChatStore;