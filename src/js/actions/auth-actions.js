var AppDispatcher = require('../dispatcher/app-dispatcher');
var Bulldog = require('../libs/bulldog');
var Api = require('../libs/api');

var AuthActions = {
  getUser: function(id) {
    Api.get({
      endpoint: '/users/' + id,
    })
    .done(function(data){
      AppDispatcher.dispatch('user.configuration', {user: data});
    });
  },
  
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
