var React = require('react');
var Recording = require('./recording');
var _ = require('underscore');

var Recordings = React.createClass({
  render: function() {
    var list = [];
    var recordings = this.getStore('recordingsStore');
    
    _.each(recordings, function(recording){
      list.push(<Recording key={recording.id} recording={recording} />);
    });
    
    return <div id="recordings">
      <h2>Recordings</h2>
      <ol>{list}</ol>
    </div>;
  }
});

module.exports = Recordings;