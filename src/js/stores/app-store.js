var Flux = require('delorean').Flux;
var _ = require('underscore');

var AppStore = Flux.createStore({
  
  scheme: {
    organization_id: null
  },

  actions: {
    'app.configured': 'reset'
  },

  reset: function(data) {
    if(!this.state.organization_id) {
      var firstOrg = _.values(data.organizations)[0]
      var orgId = firstOrg ? firstOrg.id : null;
      this.set({organization_id:orgId})
    }
  },

});

module.exports = AppStore;


