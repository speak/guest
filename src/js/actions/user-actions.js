var AppDispatcher = require('../dispatcher/app-dispatcher');

var UserActions = {
  channelToggleHighlight: function(user_id, type) {
    AppDispatcher.dispatch('channel.highlighted', {
      user_id: user_id,
      type: type
    });
  }
};

module.exports = UserActions;