var Store =  require('./store');

var ChannelStore = new Store({
  actions: {
    'channel.found':    'reset',
    'channel.created':  'reset',
    'session.destroy':  'destroy'
  },

  destroy: function(data){
    this.state = {};
    this.emit('change');
  },

  reset: function(data){
    this.state = data;
    this.emit('change');
  },

});

module.exports = ChannelStore;
