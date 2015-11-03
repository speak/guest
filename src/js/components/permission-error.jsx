var React = require('react');

var PermissionError = React.createClass({
  
  render: function() {
    return <div id="permission-error">
      <h2>Whoops</h2>
      <p>Sorry, camera and microphone access are needed to use Speak!</p>
    </div>;
  }
});

module.exports = PermissionError;