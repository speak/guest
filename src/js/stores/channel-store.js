var Store =  require('./store');

var ChannelStore = new Store({
  actions: {
    'channel.found':    'reset',
    'channel.created':  'reset',
  },

  reset: function(data){
    this.state = data;
    this.emit('change');
  },

});

module.exports = ChannelStore;