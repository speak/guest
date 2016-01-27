var React = require('react');
var Flux = require('delorean').Flux;
var Recording = require('./recording');
var AppActions = require('../actions/app-actions');
var _ = require('underscore');

var Recordings = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['recordingsStore'],
  
  componentDidMount: function() {
    AppActions.recordingsLoad();
  },
  
  render: function() {
    var list = [];
    var recordings = this.getStore('recordingsStore');
    
    _.each(recordings, function(recording){
      list.push(<Recording key={recording.id} recording={recording} />);
    });
    
    return <div id="recordings" className="modal-with-menu">
      <div className="content">
        <h1>Recordings</h1>
        <ol>{list}</ol>
      </div>
    </div>;
  }
});

module.exports = Recordings;