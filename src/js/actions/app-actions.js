var AppDispatcher = require('../dispatcher/app-dispatcher');
// var UserStore = require('../stores/user-store');
var Analytics = require('../libs/analytics');
var Config = require('config');
var dns = require('dns');

var AppActions = {
  online: function() {
    AppDispatcher.dispatch('app.online');
  },

  offline: function() {
    AppDispatcher.dispatch('app.offline');    
  },
   
  show: function(page) {
    AppDispatcher.dispatch('app.show', page);
  },

  focusWindow: function(name) {
    AppDispatcher.dispatch('window.focus', name);
  },
  
  openWindow: function(name) {
    AppDispatcher.dispatch('window.open', name);
  },

  closeWindow: function(name) {
    AppDispatcher.dispatch('window.close', name);
  },
  
  showWindow: function(name) {
    AppDispatcher.dispatch('window.show', name);
  },

  pinWindow: function(name) {
    AppDispatcher.dispatch('window.pin', name);
  },

  unpinWindow: function(name) {
    AppDispatcher.dispatch('window.unpin', name);
  },

  hideWindow: function(name) {
    AppDispatcher.dispatch('window.hide', name);
  },
  
  save: function(state) {
    AppDispatcher.dispatch('preference.save', state);
    
    if (state.debugging_tools === true) this.debuggingEnabled();
    if (state.debugging_tools === false) this.debuggingDisabled();
  },

  upgradeClose: function(state) {
    Analytics.track('upgrade.cancel');
    AppDispatcher.dispatch('app.save', {upgrade_message: false});
  },

  updateTimezone: function(name) {
    if (name && (UserStore.get('timezone') != name)) {
      AppDispatcher.dispatch('user.update', {timezone: name});
    }
  },
  
  debuggingEnabled: function() {
    AppDispatcher.dispatch('app.debugging_enabled');
  },
  
  debuggingDisabled: function() {
    AppDispatcher.dispatch('app.debugging_disabled');
  },

  updateAudioPreferences: function(props) {
    Analytics.track('preferences.audio');
    AppDispatcher.dispatch('preference.save', props);
    
    // Ensure that we update our media stream
    AppDispatcher.dispatch('app.request_audio_stream', true);
  },

  updateVideoPreferences: function(props) {
    Analytics.track('preferences.video');
    AppDispatcher.dispatch('preference.save', props);
    
    // Ensure that we update our media stream
    AppDispatcher.dispatch('app.request_video_stream', true);
  },

  bannerSuccess: function(message, opts) {
    if (opts && opts.fallback) {
      var title = opts.title ? opts.title : "Hey there"
      this.desktopNotification(title, message);
    } else {
      AppDispatcher.dispatch('banner.success', message);
    }
  },

  bannerError: function(message, opts) {
    if (opts && opts.fallback) {
      var title = opts.title ? opts.title : "Whoops"
      this.desktopNotification(title, message);
    } else {
      AppDispatcher.dispatch('banner.error', message);
    }
  },
  
  bannerClose: function() {
    AppDispatcher.dispatch('banner.close');
  },

  desktopNotification: function(title, body) {
    new Notification(title, { 
      body:body
    });
  },

  updatePreferredServer: function(){
    dns.lookup(Config.hosts.twoface.replace(/^http:\/\//i, ''), function(err, ip) { 
      if(!err && UserStore.get('preferred_server') != ip) {
        AppDispatcher.dispatch('user.update', {preferred_server: ip});
      }
    });
  },

  clearCache: function() {
    AppDispatcher.dispatch('cache.clear');
  },

  signOut: function() {
    AppDispatcher.dispatch('session.destroy');
  },

  netscanResults: function(results) {
    AppDispatcher.dispatch('netscan.results', results);
  },

  showTray: function() {
    AppDispatcher.dispatch('tray.show');
  },

  hideTray: function() {
    AppDispatcher.dispatch('tray.hide');
  },

  quit: function() {
    AppDispatcher.dispatch('app.quit');
  },

  requestConfiguration: function() {
    AppDispatcher.dispatch('user.configure');
  },

  installUpdate: function(){
    AppDispatcher.dispatch('app.install_update');
  }
};

module.exports = AppActions;
