var React = require('react');

var PermissionDialog = React.createClass({
  
  render: function() {
    return <div id="permission-dialog">
      <h2>Tap, tap, is this thing on?</h2>
      <p>Please click allow near the top of your browser window to grant access to your microphone and camera.</p>
    </div>;
  }
});

module.exports = PermissionDialog;