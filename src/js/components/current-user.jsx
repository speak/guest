var React = require('react');
var UserActions = require('../actions/user-actions');

var CurrentUser = React.createClass({
  
  handleClick: function() {
    UserActions.showModal('preferences');
  },

  render: function() {
    return <a id="current-user" onClick={this.handleClick}>Settings</a>;
  }
});

module.exports = CurrentUser;