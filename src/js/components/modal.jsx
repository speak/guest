var React = require('react');
var UserActions = require('../actions/user-actions');
var ChannelShare = require('./channel-share');
var Recording = require('./recording');

var Modal = React.createClass({
  
  getContent: function() {
    switch(this.props.name) {
      case 'add-people':
        return <ChannelShare path={this.props.channel.path} />;
      case 'recording':
        return <Recording />;
    }
  },
  
  closeModal: function() {
    UserActions.closeModal();
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
    return <div id="modal" className="animated fadeIn">
      <a onClick={this.closeModal} className="close">✕</a>
      {this.getContent()}
    </div>;
  }
});

module.exports = Modal;