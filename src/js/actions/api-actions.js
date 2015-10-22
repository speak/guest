var AppDispatcher = require('../dispatcher/app-dispatcher');
var Api = require('../libs/api');

var ApiActions = {
  configured: function(data) {
    AppDispatcher.dispatch('app.configured', data);
  },

  organizationUpdated: function(data) {
    AppDispatcher.dispatch('organization.updated', data);
  },

  error: function(){
    //TODO
  }
};

module.exports = ApiActions;

