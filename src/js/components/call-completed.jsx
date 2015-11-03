var React = require('react');

var CallCompleted = React.createClass({
  
  render: function() {
    return <div id="call-completed">
      Looks like the call is over.
    </div>;
  }
});

module.exports = CallCompleted;