var AppDispatcher = require('../dispatcher/app-dispatcher');
var Bulldog = require('../libs/bulldog');

var AuthActions = {
  create: function(input, options) {
    Bulldog.createUser(input, options);
  },

  signout: function(input) {
    AppDispatcher.dispatch('session.destroy');
  },
  
  signin: function(input, options) {
    Bulldog.createSessionFromEmailPassword(input, options);
  }
};

module.exports = AuthActions;
