var React = require('react');

var CallCompleted = React.createClass({
  
  render: function() {
    return <div id="call-completed">
      <h2>Oh, everyone left.</h2>
      <p>It looks like the call is over. Have you tried our <br/><a href="https://speak.io/download">Speak desktop app</a> yet? It&#39;s pretty neat!</p>
    </div>;
  }
});

module.exports = CallCompleted;