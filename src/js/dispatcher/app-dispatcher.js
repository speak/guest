var Flux = require('delorean').Flux;
var AuthStore = require('../stores/auth-store');
var AppStore = require('../stores/app-store');
var OrganizationsStore = require('../stores/organizations-store');

var AppDispatcher = Flux.createDispatcher({
  getStores: function() {
    return {
      authStore: AuthStore,
      appStore: AppStore,
      organizationsStore: OrganizationsStore
    }
  }
});

module.exports = AppDispatcher;
