var Config = require('config');

// error reporting before anything else
if (Config.report_errors) {
  Raven.config(Config.tokens.sentry).install();
}

var React = require('react');
var ReactDOM = require('react-dom');
var Bulldog = require('./libs/bulldog');
var Calls = require('./libs/calls');
var Socks = require('./libs/socks');
var Sound = require('./libs/sound');
var WebRTC = require('./libs/webrtc');
var OpenTok = require('./libs/opentok');
var AppDispatcher = require('./dispatcher/app-dispatcher');
var AppActions = require('./actions/app-actions');
var App = require('./components/app');
var AuthStore = require('./stores/auth-store');
var channelId = window.location.pathname.split('/')[1];

Sound.loadAll();

if (AuthStore.get('token')) {
  Bulldog.createSessionFromToken(AuthStore.get('token'));
}

if (channelId) {
  AppActions.channelLoad(channelId);
}

// forward events into webrtc and socks libs
AppDispatcher.register(function(action, payload, options) {
  Socks.dispatchAction(action, payload, options);
  WebRTC.dispatchAction(action, payload);
  Calls.dispatchAction(action, payload);
  OpenTok.dispatchAction(action, payload);
  Sound.dispatchAction(action, payload);
});

// React Router does all the fancy stuff for us
ReactDOM.render(<App dispatcher={AppDispatcher} />, document.getElementById('guest'));

window.addEventListener('beforeunload', AppActions.quitting);
