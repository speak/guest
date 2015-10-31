var React = require('react');
var Config = require('config');

var ChannelInfo = React.createClass({
  render: function() {
    return <div id="channel-info">
      <h2>Your Meeting URL</h2>
      <h3>{Config.hosts.app + "/" + this.props.path}</h3>
    </div>;
  }
});

module.exports = ChannelInfo;

