var Store =  require('./store');

var ChatStore = new Store({
  storeName: 'chat',
  
  actions: {
    'message.create':      'messageCreate',
    'message.persisted':   'messagePersisted'
  },

  messageCreate: function(data){
    this.update(data);
  },

  messagePersisted: function(data){
    var message = this.get(data.id);
    delete this.state[data.id];

    message.id = data.server_id;
    message.persisted = true;

    this.state[data.server_id] = message;
    this.emit("change");
  }

});

module.exports = ChatStore;

