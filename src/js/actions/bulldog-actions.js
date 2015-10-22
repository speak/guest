var AppDispatcher = require('../dispatcher/app-dispatcher');
var Api = require('../libs/api');

var BulldogActions = {
  signedIn: function(data) {
    AppDispatcher.dispatch('user.signedin', data);
    AppDispatcher.dispatch('session.created', data);
    Api.configure();
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
