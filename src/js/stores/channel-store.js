var Flux = require('delorean').Flux;
var _ = require('underscore');

var ChannelStore = Flux.createStore({
  
  actions: {
    'channel.found': 'reset',
    'channel.created': 'reset'
  },

  reset: function(data){
    this.state = data;
    this.emit('change');
  }

});

module.exports = ChannelStore;

