var AppDispatcher = require('../dispatcher/app-dispatcher');

var UserActions = {
  requestMediaPermissions: function(data) {
    AppDispatcher.dispatch('app.request_audio_stream');
  }
};

module.exports = UserActions;