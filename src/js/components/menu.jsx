var React = require('react');
var AuthActions = require('../actions/auth-actions');
var UserActions = require('../actions/user-actions');

var Menu = React.createClass({
  
  handleKeydown: function(ev) {
    if (ev.keyCode === 27) {
      UserActions.closeMenu();
    }
  },
  
  componentDidMount: function() {
    window.addEventListener('keydown', this.handleKeydown);
  },
  
  componentWillUnmount: function() {
    window.removeEventListener('keydown', this.handleKeydown);
  },
  
  signout: function(){
    AuthActions.signout();
  },
  
  render: function() {
    return <nav id="menu">
      <ul>
        <li><a href="/" >Home</a></li>
        <li><a>Recordings</a></li>
        <li><a>Account</a></li>
        <li><a>Billing</a></li>
        <li><a>Settings</a></li>
        <li><a href="mailto:howdy@speak.io" target="_blank">Help</a></li>
        <li><a onClick={this.signout}>Sign Out</a></li>
      </ul>
    </nav>;
  }
});

module.exports = Menu;