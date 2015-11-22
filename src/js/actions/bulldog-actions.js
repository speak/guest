var AppDispatcher = require('../dispatcher/app-dispatcher');
var ChannelStore = require('../stores/channel-store');
var Api = require('../libs/api');

var BulldogActions = {
  signedIn: function(data) {
    document.getElementById('home').style.display='none';
    document.getElementById('guest').style.display='block';
    
    AppDispatcher.dispatch('user.signedin', data);
    AppDispatcher.dispatch('session.created', data.ticket);
  },

  error: function(response) {
    AppDispatcher.dispatch('banner.error', response.params);
    AppDispatcher.dispatch('session.error', response);
  },

  reset: function(response) {
    AppDispatcher.dispatch('session.error', response);
  }
};

module.exports = BulldogActions;
