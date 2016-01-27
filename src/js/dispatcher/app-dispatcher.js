var Flux = require('delorean').Flux;
var AuthStore = require('../stores/auth-store');
var AppStore = require('../stores/app-store');
var utils = require('../libs/utilities');
var UsersStore = require('../stores/users-store');
var ChannelStore = require('../stores/channel-store');
var PreferencesStore = require('../stores/preferences-store');
var RecordingsStore = require('../stores/recordings-store');
var MessagesStore = require('../stores/messages-store');
var Config = require('config');
var transactions = {};

var AppDispatcher = Flux.createDispatcher({
  getStores: function() {
    return {
      authStore: AuthStore,
      appStore: AppStore,
      messagesStore: MessagesStore,
      usersStore: UsersStore,
      channelStore: ChannelStore,
      preferencesStore: PreferencesStore,
      recordingsStore: RecordingsStore
    }
  }
});

AppDispatcher._dispatch = AppDispatcher.dispatch;
AppDispatcher.dispatch = function(action, payload) {
  if (Config.environment != 'production') {
    console.log(action, payload);
  }
  
  var args = [];
  
  // v8 optimization: https://code.google.com/p/v8/issues/detail?id=3037
  for (var index=0; index < arguments.length; index++) {
    args.push(arguments[index]);
  }
  var options = args[2];
  
  // run callbacks for transaction_id if available
  if (options) {
    if (typeof options == 'string') {
      var transaction = transactions[options];

      // okay, we have a transaction for this renderer
      if (transaction) {
        if (action.match(/^error/i)) {
          if (typeof transaction.error == 'function') transaction.error(payload);
        } else {
          if (typeof transaction.success == 'function') transaction.success(payload);
        }
  
        // remove once fulfilled
        delete transactions[options];
      }

    // translate callbacks into transaction_id
    } else if (typeof options == 'object') {
      var transaction_id = utils.generateTransactionId();
      transactions[transaction_id] = options;
      args[2] = transaction_id;
    }
  }
  
  return AppDispatcher._dispatch.apply(this, args);
};

module.exports = AppDispatcher;
