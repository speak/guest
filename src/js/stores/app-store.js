var Flux = require('delorean').Flux;
var _ = require('underscore');

var AppStore = Flux.createStore({
  
  scheme: {
    user_id:         null,
    organization_id: null,
    muted:           false,
    online:          true,
    stream:          null,
    level:           null
  },

  actions: {
    'user.configuration': 'reset'
  },

  reset: function(data) {
    this.set({
      user_id: data.user.id,
      level: data.user.level
    })
  },

});

module.exports = AppStore;


