var React = require('react');
var Config = require('config');
var Clipboard = require('clipboard');
var UserActions = require('../actions/user-actions');

var ChannelShare = React.createClass({

  getInitialState: function() {
    return {
      tooltip: ''
    }
  },

  componentDidMount: function() {
    if (this.refs.copyable) {
      var clippy = new Clipboard(this.refs.copyable);
      clippy.on('success', this.copiedToClipboard);

      this.resetTooltip();
      this.setState({clipboard: clippy });
    }
  },
  
  componentWillUnmount: function() {
    if (this.state.clipboard) {
      this.state.clipboard.destroy();
    }
  },

  copiedToClipboard: function() {
    this.setState({tooltip: 'Copied!'});
    setTimeout(this.resetTooltip, 3000);
  },
  
  resetTooltip: function() {
    if (!this.isMounted()) return;
    this.setState({tooltip: 'Click to copy'});
  },

  addPeople: function() {
    UserActions.showModal('add-people');
  },

  render: function() {
    var url = Config.hosts.app + "/" + this.props.path;
    var display = url.replace(/^https?:\/\//gi, "");
    
    if (this.props.waiting) {
      return <div id="channel-share" className="centered">
        <h2>Waiting for others&hellip;</h2>
        <p>Looks like you are the first person here, <br/>need to <a onClick={this.addPeople}>invite others to the call</a>?</p>
      </div>;
    } else {
      return <div id="channel-share" className="centered">
        <h2>
          <span data-clipboard-text={url} ref="copyable" className="copyable">{display}</span>
          <span className="tooltip">{this.state.tooltip}</span>
        </h2>
        <p>This is your unique link, share it to invite <br/> other people into this call!</p>
      </div>;
    }
  }
});

module.exports = ChannelShare;
