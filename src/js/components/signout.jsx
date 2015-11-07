var React = require('react');
var AppActions = require('../actions/app-actions');

var Signout = React.createClass({
  handleClick: function(){
    AppActions.signOut();
  },
  
  render: function () {
    return <a onClick={this.handleClick}>Sign Out</a>;
  }
});

module.exports = Signout;