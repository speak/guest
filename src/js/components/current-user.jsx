var React = require('react');
var AuthActions = require('../actions/auth-actions');
var UserActions = require('../actions/user-actions');

var CurrentUser = React.createClass({
  mixins: [require('react-onclickoutside')],
  
  getInitialState: function() {
    return {
      enabled: false
    }
  },
  
  handleClickOutside: function() {
    if (this.state.enabled) {
      this.setState({enabled: false});
    }
  },
  
  toggleMenu: function() {
    this.setState({enabled: !this.state.enabled});
  },
  
  signout: function(){
    AuthActions.signout();
  },
  
  preferences: function() {
    UserActions.showModal('preferences');
  },

  render: function() {
    var nav;
    
    if (this.state.enabled) {
      // <li><a onClick={this.preferences}>Preferences</a></li>
      // <li><a href="https://account.speak.io" target="_blank">Account</a></li>
      
      nav = <nav className="dropdown animated slideFadeDown">
        <ul>
          <li><a href="mailto:howdy@speak.io" target="_blank">Help</a></li>
          <li><a onClick={this.signout}>Sign Out</a></li>
          <li><a onClick={this.preferences}>Preferences</a></li>
        </ul>
      </nav>;
    }
    
    return <div id="current-user">
      <a onClick={this.toggleMenu} className="cog"></a>
      {nav}
    </div>;
  }
});

module.exports = CurrentUser;