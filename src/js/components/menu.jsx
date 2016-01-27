var React = require('react');
var Flux = require('delorean').Flux;

var AuthActions = require('../actions/auth-actions');
var UserActions = require('../actions/user-actions');

var Menu = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['appStore'],

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
  
  preferences: function() {
    UserActions.showModal('preferences');
  },
  
  recordings: function() {
    UserActions.showModal('recordings');
  },
  
  account: function() {
    UserActions.showModal('account');
  },
  
  billing: function() {
    UserActions.showModal('billing');
  },
  
  signout: function(){
    AuthActions.signout();
  },
  
  render: function() {
    var app = this.getStore('appStore');
    
    return <nav id="menu">
      <ul>
        <li><a href="/" >Home</a></li>
        <li><a onClick={this.recordings} className={app.modal == "recordings" ? "enabled" : ""}>Recordings</a></li>
        <li><a onClick={this.account} className={app.modal == "account" ? "enabled" : ""}>Account</a></li>
        <li><a onClick={this.billing} className={app.modal == "billing" ? "enabled" : ""}>Billing</a></li>
        <li><a onClick={this.preferences} className={app.modal == "preferences" ? "enabled" : ""}>Preferences</a></li>
        <li><a href="mailto:howdy@speak.io" target="_blank">Help</a></li>
        <li><a onClick={this.signout}>Sign Out</a></li>
      </ul>
    </nav>;
  }
});

module.exports = Menu;