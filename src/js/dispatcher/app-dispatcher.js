var Flux = require('delorean').Flux;
var AuthStore = require('../stores/auth-store');
var AppStore = require('../stores/app-store');
var OrganizationsStore = require('../stores/organizations-store');
var ChannelStore = require('../stores/channel-store');

var AppDispatcher = Flux.createDispatcher({
  getStores: function() {
    return {
      authStore: AuthStore,
      appStore: AppStore,
      channelStore: ChannelStore,
      organizationsStore: OrganizationsStore
    }
  }
});

module.exports = AppDispatcher;
