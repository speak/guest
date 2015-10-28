var AppDispatcher = require('../dispatcher/app-dispatcher');

var Analytics = {
  track: function(event, properties) {
    AppDispatcher.dispatch('analytics.track', {
      event: event,
      properties: properties || {}
    });
  }
};

module.exports = Analytics;