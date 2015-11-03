var React = require('react');
var Config = require('config');

var ChannelInfo = React.createClass({
  render: function() {
    var host = Config.hosts.app.replace(/^https?:\/\//gi, "");
    
    return <div id="channel-info">
      <h2>Your Meeting URL</h2>
      <h3>{host + "/" + this.props.path}</h3>
    </div>;
  }
});

module.exports = ChannelInfo;