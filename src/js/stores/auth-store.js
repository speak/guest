var Flux = require('delorean').Flux;

var AuthStore = Flux.createStore({

  scheme: {
    id: null,
    ticket: null,
    token: function(){
      return localStorage.getItem("token") || null;
    }
  },
  
  actions: {
    'user.signedin':   'updateAuth',
    'session.error':   'removeAuth',
    'session.destroy': 'removeAuth'
  },

  updateAuth: function(data) {
    var update = {};
    
    if (data.token) {
      update.token = data.token;
      localStorage.setItem('token', data.token);
    }
    if (data.ticket) update.ticket = data.ticket;
    this.set(update);
  },
  
  removeAuth: function(data) {
    localStorage.removeItem('token')
    this.set({
      ticket: null,
      token: null
    });
  }
});

module.exports = AuthStore;
