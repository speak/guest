var React = require('react');
var ReactDOM = require('react-dom')

var Api = require('./libs/api');
var Bulldog = require('./libs/bulldog');
var Calls = require('./libs/calls');
var Socks = require('./libs/socks');
var WebRTC = require('./libs/webrtc');
var OpenTok = require('./libs/opentok');
var AppDispatcher = require('./dispatcher/app-dispatcher');
var App = require('./components/app');
var AuthStore = require('./stores/auth-store');
var channelId = window.location.pathname.split('/')[1];

if (AuthStore.get('token')) {
  Bulldog.createSessionFromToken(AuthStore.get('token'));
}

if (channelId) {
  Api.getChannel(channelId);
}

// forward events into webrtc and socks libs
AppDispatcher.register(function(action, payload, options) {
  Socks.dispatchAction(action, payload, options);
  WebRTC.dispatchAction(action, payload);
  Calls.dispatchAction(action, payload);
  OpenTok.dispatchAction(action, payload);
  // Sound.dispatchAction(action, payload);
});

// React Router does all the fancy stuff for us
ReactDOM.render(<App dispatcher={AppDispatcher} />, document.getElementById('guest'));
