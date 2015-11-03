var React = require('react');
var Config = require('config');
var Clipboard = require('clipboard');

var ChannelInfo = React.createClass({
  
  componentDidMount: function() {
    this.setState({clipboard: new Clipboard(this.refs.copyable) });
  },
  
  componentWillUnmount: function() {
    this.state.clipboard.destroy();
  },
  
  render: function() {
    var url = Config.hosts.app + "/" + this.props.path;
    var display = url.replace(/^https?:\/\//gi, "");
    
    return <div id="channel-info">
      <h2>Your Meeting URL</h2>
      <h3 data-clipboard-text={url} ref="copyable">{display}</h3>
    </div>;
  }
});

module.exports = ChannelInfo;