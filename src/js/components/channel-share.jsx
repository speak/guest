var React = require('react');
var Config = require('config');
var Clipboard = require('clipboard');
var UserActions = require('../actions/user-actions');

var ChannelShare = React.createClass({
  
  componentDidMount: function() {
    this.setState({clipboard: new Clipboard(this.refs.copyable) });
  },
  
  componentWillUnmount: function() {
    this.state.clipboard.destroy();
  },

  addPeople: function() {
    UserActions.showModal('add-people');
  },

  render: function() {
    var url = Config.hosts.app + "/" + this.props.path;
    var display = url.replace(/^https?:\/\//gi, "");
    
    if (this.props.waiting) {
      return <div id="channel-info">
        <h2 data-clipboard-text={url} ref="copyable">Waiting for others&hellip;</h2>
        <p>Looks like you are the first person here, <br/>need to <a onClick={this.addPeople}>invite others to the call</a>?</p>
      </div>;
    } else {
      return <div id="channel-info">
        <h2 data-clipboard-text={url} ref="copyable">{display}</h2>
        <p>This is your unique link, share it to invite <br/> other people into this call!</p>
      </div>;
    }
  }
});

module.exports = ChannelShare;
