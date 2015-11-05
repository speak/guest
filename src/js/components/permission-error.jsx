var React = require('react');

var PermissionError = React.createClass({
  
  render: function() {
    return <div id="permission-error">
      <h2>Whoa, denied!</h2>
      <p>Sorry, camera and microphone access are needed to use Speak! 
      Please click the camera icon in your address bar to grant access.</p>
    </div>;
  }
});

module.exports = PermissionError;