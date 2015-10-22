var Flux = require('delorean').Flux;

var AuthStore = Flux.createStore({

  scheme: {
    id: null,
    ticket: null,
    token: function(){
      return localStorage.getItem("token");
    }
  },
  
  actions: {
    'session.created': 'sessionCreated',
    'session.destroy': 'sessionDestroy'
  },

  sessionCreated: function(data) {
    localStorage.setItem('token', data.token)
    this.set(data);
  },
  
  sessionDestroy: function(data) {
    localStorage.removeItem('token')
    this.set({
      ticket: null,
      token: null
    });
  }
});

module.exports = AuthStore;
