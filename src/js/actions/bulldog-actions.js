var AppDispatcher = require('../dispatcher/app-dispatcher');
var ChannelStore = require('../stores/channel-store');
var Api = require('../libs/api');

var BulldogActions = {
  signedIn: function(data) {
    AppDispatcher.dispatch('user.signedin', data);
    AppDispatcher.dispatch('session.created', data.ticket);
    document.getElementById('home').style.display='none';
    document.getElementById('guest').style.display='block';
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
