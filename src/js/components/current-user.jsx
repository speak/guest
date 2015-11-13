var React = require('react');
var AuthActions = require('../actions/auth-actions');
var UserActions = require('../actions/user-actions');
var Avatar = require('speak-widgets').Avatar;

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
  
  signout: function( ){
    AuthActions.signout();
  },

  render: function() {
    var nav;
    
    if (this.state.enabled) {
      nav = <nav className="dropdown animated slideFadeDown">
        <ul>
          <li><a onClick={this.signout}>Sign Out</a></li>
        </ul>
      </nav>;
    }
    
    return <div id="current-user">
      <a onClick={this.toggleMenu}>
        <Avatar user={this.props.user} circle={true} simple={true} />
      </a>
      {nav}
    </div>;
  }
});

module.exports = CurrentUser;