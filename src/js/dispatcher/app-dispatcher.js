var Flux = require('delorean').Flux;
var AuthStore = require('../stores/auth-store');
var AppStore = require('../stores/app-store');
var utilities = require('../libs/utilities');
var UsersStore = require('../stores/users-store');
var ChannelStore = require('../stores/channel-store');

var transactions = {};

var AppDispatcher = Flux.createDispatcher({
  getStores: function() {
    return {
      authStore: AuthStore,
      appStore: AppStore,
      channelStore: ChannelStore,
      usersStore: UsersStore
    }
  }
});

AppDispatcher._dispatch = AppDispatcher.dispatch;
AppDispatcher.dispatch = function(action, payload) {
  var args = [];
  
  // v8 optimization: https://code.google.com/p/v8/issues/detail?id=3037
  for (var index=0; index < arguments.length; index++) {
    args.push(arguments[index]);
  }
  var options = args[2];
  
  // run callbacks for transaction_id if available
  if (options) {
    if (typeof options == 'string') {
      console.log("McLogging out")
      console.log(options)
      console.log(transactions)
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
      console.log("McLogging in")

      var transaction_id = utilities.generateTransactionId();
      transactions[transaction_id] = options;
      args[2] = transaction_id;
    }
  }
  
  return AppDispatcher._dispatch.apply(this, args);
};

module.exports = AppDispatcher;
