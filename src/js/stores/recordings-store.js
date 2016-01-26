var Store =  require('./store');

var RecordingsStore = new Store({
  storeName: 'recordings',

  actions: {
    'recording.created':   'recordingCreated',
    'recording.persisted': 'recordingPersisted',
    'recording.deleted':   'recordingDeleted'
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