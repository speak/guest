var React = require('react');
var Flux = require('delorean').Flux;
var Recording = require('./recording');
var AppActions = require('../actions/app-actions');
var _ = require('underscore');

var Recordings = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['recordingsStore'],
  
  getInitialState: function() {
    return {
      loading: true,
      loaded: false
    }
  },
  
  componentDidMount: function() {
    AppActions.recordingsLoad().done(function(){
      this.setState({loaded: true, loading: false});
    }.bind(this));
  },
  
  getContent: function() {
    var recordings = this.getStore('recordingsStore');
    var list = [];
    
    if (!recordings.length) {
      if (this.state.loaded) {
        return <p>No recordings just yet.</p>;
      } else {
        return <p>Loading&hellip;</p>;
      }
    } else {
      _.each(recordings, function(recording){
        list.push(<Recording key={recording.id} recording={recording} />);
      });
      return <ol>{list}</ol>
    }
  },
  
  render: function() {
    return <div id="recordings" className="modal-with-menu">
      <div className="content">
        <h1>Recordings</h1>
        {this.getContent()}
      </div>
    </div>;
  }
});

module.exports = Recordings;