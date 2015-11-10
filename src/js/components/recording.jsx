var React = require('react');

var Recording = React.createClass({

  render: function() {
    return <div id="recording" className="centered">
        <h2>Recording coming soon!</h2>
        <p>We&#39;re working hard on building out recording, add your email and 
        we&#39;ll let you know when it&#39;s ready!</p>
    </div>;
  }
});

module.exports = Recording;