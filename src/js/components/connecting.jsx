var React = require('react');

var Connecting = React.createClass({
  
  render: function() {
    // TODO: slow connections
    
    return <div id="loading">
      <h2><span className="loading">Connecting</span></h2>
    </div>;
  }
});

module.exports = Connecting;