var React = require('react');
var UserActions = require('../actions/user-actions');
var ChannelShare = require('./channel-share');
var ChannelLock = require('./channel-lock');
var Upgrade = require('./upgrade');
var Preferences = require('./preferences');
var Billing = require('./billing');
var Account = require('./account');
var Recordings = require('./recordings');

var Modal = React.createClass({
  
  getContent: function() {
    switch(this.props.name) {
      case 'lock':
        return <ChannelLock locked={this.props.channel.locked} />;
      case 'add-people':
        return <ChannelShare path={this.props.channel.path} />;
      case 'upgrade':
        return <Upgrade />;
      case 'billing':
        return <Billing />;
      case 'account':
        return <Account />;
      case 'recordings':
        return <Recordings />;
      default:
      case 'preferences':
        return <Preferences user={this.props.user} />;
    }
  },
  
  closeModal: function() {
    UserActions.closeModal();
    UserActions.closeMenu();
  },
  
  handleKeydown: function(ev) {
    if (ev.keyCode === 27) {
      UserActions.closeModal();
    }
  },
  
  componentDidMount: function() {
    window.addEventListener('keydown', this.handleKeydown);
  },
  
  componentWillUnmount: function() {
    window.removeEventListener('keydown', this.handleKeydown);
  },
  
  render: function() {
    return <div id="modal" className="animated fadeAndZoomIn">
      {this.getContent()}
      <a onClick={this.closeModal} className="close">
        <span>✕</span>
        <span className="shortcut">esc</span>
      </a>
    </div>;
  }
});

module.exports = Modal;