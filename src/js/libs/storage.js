var Config = require('config');
var env = Config.environment;

var Storage = {
  set: function(key, value) {
    return localStorage.setItem(env + '-' + key, JSON.stringify(value));
  },
  
  get: function(key) {
    return JSON.parse(localStorage.getItem(env + '-' + key) || false);
  }
}

module.exports = Storage;