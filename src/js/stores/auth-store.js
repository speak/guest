var Store =  require('./store');

var AuthStore = new Store({
  storeName: 'auth',
  persisted: true,
  
  scheme: {
    id: null,
    ticket: null,
    email: '',
    token: null
  },
  
  actions: {
    'user.signedin':   'updateAuth',
    'session.error':   'removeAuth',
    'session.destroy': 'removeAuth'
  },

  updateAuth: function(data) {
    var update = {};
    if (data.token) update.token = data.token;
    if (data.ticket) update.ticket = data.ticket;
    if (data.email) update.email = data.email;
    this.set(update);
  },
  
  removeAuth: function(data) {
    this.set({
      ticket: null,
      token: null
    });
  }
});

module.exports = AuthStore;