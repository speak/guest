var Config = require('config');

// error reporting before anything else
if (Config.report_errors) {
  Raven.config(Config.tokens.sentry).install();
}

var React = require('react');
var ReactDOM = require('react-dom');
var Bulldog = require('./libs/bulldog');
var Socks = require('./libs/socks');
var Sound = require('./libs/sound');
var OpenTok = require('./libs/opentok');
var AppDispatcher = require('./dispatcher/app-dispatcher');
var AppActions = require('./actions/app-actions');
var App = require('./components/app');
var AuthStore = require('./stores/auth-store');
var channelId = window.location.pathname.split('/')[1];
var registrationRequested = false;
var _ = require('underscore');
var $ = require('jquery');

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
  OpenTok.dispatchAction(action, payload);
  Sound.dispatchAction(action, payload);
});

// React Router does all the fancy stuff for us
ReactDOM.render(<App dispatcher={AppDispatcher} />, document.getElementById('guest'));

window.addEventListener('beforeunload', AppActions.quitting);

// register the client with gcm
window.addEventListener('message', function(event){
  if (event.data && typeof event.data == 'object' && event.data.from == 'extension') {
    AppActions.extensionLoaded();
    
    // waits for extensionLoaded message before attempting
    if (!registrationRequested) {
      registrationRequested = true;
      window.postMessage({method: 'registerWithGCM'}, '*');
    }
    
    if (event.data.method == 'registrationId') {
      AppActions.extensionRegistered(event.data.payload);
    }
  }
});

// choose a random background image
document.getElementById('guest').style.backgroundImage = "url('" + _.sample([
  '/images/backgrounds/photo-1446080501695-8e929f879f2b.jpg',
  '/images/backgrounds/photo-1441906363162-903afd0d3d52.jpg',
  '/images/backgrounds/wdXqHcTwSTmLuKOGz92L_Landscape.jpg',
  '/images/backgrounds/photo-1444090542259-0af8fa96557e.jpg',
  '/images/backgrounds/photo-1441155472722-d17942a2b76a.jpg'
]) + "')";

// allow homepage signin
$(function() {
  $('.homepage-start-meeting').submit(function(ev){
    ev.preventDefault();

    if ($('#floating-modal').length) {
      var name = $(this).find('input[name=first_name]').val();
      var change = new Event('input', { bubbles: true });
      $('#floating-modal input[name=first_name]').val(name).get(0).dispatchEvent(change);
      $('#floating-modal input[type=submit]').click();
    } else {
      document.getElementById('home').style.display='none';
      document.getElementById('guest').style.display='block';
    }
  });
});
