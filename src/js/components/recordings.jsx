var React = require('react');

var Recordings = React.createClass({
  render: function() {
    return <div id="recordings" className="modal-with-menu">
      <div className="content">
        <h1>Recordings</h1>
        <p>No recordings yet</p>
      </div>
    </div>;
  }
});

module.exports = Recordings;