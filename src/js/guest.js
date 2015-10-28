var React = require('react');

var Socks = require('./libs/socks');
var AppDispatcher = require('./dispatcher/app-dispatcher');
var App = require('./components/app');
var AuthStore = require('./stores/auth-store');

// forward events into webrtc and socks libs
AppDispatcher.register(function(action, payload, options) {
  Socks.dispatchAction(action, payload, options);
  // WebRTC.dispatchAction(action, payload);
  // Calls.dispatchAction(action, payload);
  // Sound.dispatchAction(action, payload);
  // Shortcuts.dispatchAction(action, payload);
  // AppLib.dispatchAction(action, payload);
});

// React Router does all the fancy stuff for us
React.render(<App />, document.getElementById('guest'));
