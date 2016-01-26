var Store =  require('./store');

var PreferencesStore = new Store({
  storeName: 'preferences',
  persisted: true,
  
  scheme: {
    audio_sink: null,
    audio_input: null,
    video_input: null
  },

  actions: {
    'app.preferences': 'set'
  }
});

module.exports = PreferencesStore;