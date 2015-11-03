var React = require('react');

var PermissionDialog = React.createClass({
  
  render: function() {
    return <div id="permission-dialog">
      <h2>Camera &amp; Microphone</h2>
      <p>Please click allow to grant access to your camera and microphone</p>
    </div>;
  }
});

module.exports = PermissionDialog;