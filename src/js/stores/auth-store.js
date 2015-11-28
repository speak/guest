var Store =  require('./store');
var Cookies = require('js-cookie');
var Config = require('config');
var development = (Config.environment == 'development');

var AuthStore = new Store({
  storeName: 'auth',
  persisted: true,
  
  scheme: {
    id: null,
    email: '',
    access_token: null,
    refresh_token: null
  },
  
  actions: {
    'user.created':        'updateUser',
    'user.signedin':       'updateUser',
    'session.created':     'updateAuth',
    'session.error':       'removeAuth',
    'session.destroy':     'removeAuth'
  },
  
  updateUser: function(data) {
    this.set({
      id: data.id,
      email: data.email
    });
    
    Raven.setUserContext({
      id: data.id,
      email: data.email,
    });
  },

  updateAuth: function(data) {
    Cookies.set('token', data.access_token, { expires: 90, path: '', secure: !development});
    this.set(data);
  },
  
  removeAuth: function(data) {
    this.set({
      id: null,
      access_token: null,
      refresh_token: null
    });
    
    Cookies.remove('token', { path: '', secure: !development });
    Raven.setUserContext();
  }
});

module.exports = AuthStore;