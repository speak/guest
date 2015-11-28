var AppDispatcher = require('../dispatcher/app-dispatcher');
var Api = require('../libs/api');

var AuthActions = {
  
  createUser: function(data) {
    return Api.post({
      endpoint: '/users',
      data: data
    })
    .done(function(data){
      AppDispatcher.dispatch('user.created', data.user);
      AppDispatcher.dispatch('session.created', data.auth);
    });
  },
  
  getUser: function(id) {
    return Api.get({
      endpoint: '/users/' + id
    })
    .done(function(data){
      AppDispatcher.dispatch('user.found', data.user);
    });
  },
  
  signedIn: function(data) {
    document.getElementById('home').style.display='none';
    document.getElementById('guest').style.display='block';
    
    AppDispatcher.dispatch('user.signedin', data.user);
    AppDispatcher.dispatch('session.created', data.auth);
  },

  signout: function(input) {
    AppDispatcher.dispatch('session.destroy');
  }
};

module.exports = AuthActions;