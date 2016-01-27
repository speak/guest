var Store =  require('./store');
var _ = require('underscore');

var RecordingsStore = new Store({
  storeName: 'recordings',

  actions: {
    'recordings.loaded':   'recordingsLoaded',
    'recording.created':   'recordingCreated',
    'recording.persisted': 'recordingPersisted',
    'recording.deleted':   'recordingDeleted'
  },
  
  recordingsLoaded: function(data) {
    _.each(data, function(recording){
      this.update(recording);
    }.bind(this))
  },

  recordingCreated: function(data) {
    this.update(data);
  },
  
  recordingPersisted: function(data) {
    data.persisted = true;
    this.update(data);
  },
  
  recordingDeleted: function(data) {
    this.state[data.id] = null;
    this.emit('change');
  }
});

module.exports = RecordingsStore;