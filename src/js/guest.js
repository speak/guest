var React = require('react');

var Api = require('./libs/api');
var Calls = require('./libs/calls');
var Socks = require('./libs/socks');
var WebRTC = require('./libs/webrtc');
var AppDispatcher = require('./dispatcher/app-dispatcher');
var App = require('./components/app');
var AuthStore = require('./stores/auth-store');

var channelId = window.location.pathname.split('/')[1];
console.log("channel id");
console.log(channelId);

if(channelId) {
  Api.getChannel(channelId);
} else {
  Api.createChannel();
}

// forward events into webrtc and socks libs
AppDispatcher.register(function(action, payload, options) {
  Socks.dispatchAction(action, payload, options);
  WebRTC.dispatchAction(action, payload);
  Calls.dispatchAction(action, payload);
  // Sound.dispatchAction(action, payload);
});

// React Router does all the fancy stuff for us
React.render(<App />, document.getElementById('guest'));
