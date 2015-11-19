var Store =  require('./store');
var Cookies = require('js-cookie');
var Config = require('config');
var development = (Config.environment == 'development');

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
    'user.signedin':       'updateAuth',
    'session.error':       'removeAuth',
    'session.destroy':     'removeAuth'
  },

  updateAuth: function(data) {
    var update = {};
    if (data.token) {
      update.token = data.token;
      Cookies.set('token', data.token, { expires: 90, path: '', secure: !development});
    }
    if (data.ticket) update.ticket = data.ticket;
    if (data.email) update.email = data.email;
    this.set(update);
    
    Raven.setUserContext({
      id: data.id,
      email: data.email,
    });
  },
  
  removeAuth: function(data) {
    this.set({
      ticket: null,
      token: null
    });
    
    Cookies.remove('token', { path: '', secure: !development });
    Raven.setUserContext();
  }
});

module.exports = AuthStore;