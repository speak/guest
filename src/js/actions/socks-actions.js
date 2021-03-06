var AppDispatcher = require('../dispatcher/app-dispatcher');
var AuthActions = require('../actions/auth-actions');
var Bulldog = require('../libs/bulldog');
var AppActions = require('../actions/app-actions');
var _ = require('underscore');

var SocksActions = {
  message: function(event, data, transaction_id){
    // there's a pattern around the app of checking if an
    // event is directly relevant to ourselves, instead of duping
    // this logic we emit another event me.original.event
    var current_user_id = AppDispatcher.getStore('appStore').user_id;
    var user_id_matches = data && data.user_id && data.user_id == current_user_id;
    var user_matches = data && data.user && data.user.id == current_user_id;
    var id_matches = data && event.match(/^user\./) && data.id == current_user_id;
    
    if (user_id_matches || user_matches || id_matches) {
      AppDispatcher.dispatch('me.' + event, data);
    }
    
    AppDispatcher.dispatch(event, data, transaction_id);
  },
  
  reconnect: function() {
    var auth = AppDispatcher.getStore('authStore');
    
    if (auth.token) {
      Bulldog.createSessionFromToken(auth.token);
    } else {
      AuthActions.signout();
    }
  },
  
  connected: function() {
    AppDispatcher.dispatch('socks.connected');
  },
  
  disconnected: function() {
    AppDispatcher.dispatch('socks.disconnected');
  }, 

  closed: function(ev) {
    AppDispatcher.dispatch('session.destroy');

    if(ev.code == 1006) {
      AppActions.error("Whoops, an unknown error occured", {fallback: true});
    } else if (ev.code == 4000) {
      AppActions.error("Something took too long, try again?", {fallback: true});
    } else if (ev.code == 4001) {
      AppDispatcher.dispatch('app.update');
      AppDispatcher.dispatch('app.show', 'update');
    } else if(ev.code == 1001 || ev.code == 4002) {
      AppActions.error("Logged in elsewhere");
    }
  }
};

module.exports = SocksActions;
