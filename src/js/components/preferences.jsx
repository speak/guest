var React = require('react');
var Media = require('./preferences/media');

var Preferences = React.createClass({
  render: function() {
    return <div id="preferences">
      <h2>Preferences</h2>
      <Media />
    </div>;
  }
});

module.exports = Preferences;