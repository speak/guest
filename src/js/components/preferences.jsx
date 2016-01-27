var React = require('react');
var Media = require('./preferences/media');

var Preferences = React.createClass({
  render: function() {
    return <div id="preferences" className="modal-with-menu">
      <div className="content">
        <h1>Preferences</h1>
        <Media />
      </div>
    </div>;
  }
});

module.exports = Preferences;