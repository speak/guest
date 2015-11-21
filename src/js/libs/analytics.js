var AppDispatcher = require('../dispatcher/app-dispatcher');

var Analytics = {
  track: function(event, properties) {
    AppDispatcher.dispatch('analytics.track', {
      event: event,
      properties: properties || {}
    });

    ga('send', {
      hitType: 'event',
      eventCategory: event.split(".").shift(),
      eventAction: event.split(".").pop()
    });
  }
};

module.exports = Analytics;