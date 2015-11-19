var React = require('react');
var UserActions = require('../actions/user-actions');
var UsersStore = require('../stores/users-store');
var Analytics = require('../libs/analytics');
var Formsy = require('formsy-react');
var Input = require('./input');
var UpgradeMessage = require('./upgrade-message')
var ComingSoon = require('./coming-soon')

var Upgrade = React.createClass({
  
  getInitialState: function() {
    return {
      view: ''
    }
  },
  
  getContent: function() {
    switch(this.state.view) {
      case 'coming-soon':
        return <ComingSoon />
      default:
      case 'upgrade':
        return <UpgradeMessage toggleComingSoon={this.toggleComingSoon} />;
    }
  },
  
  toggleComingSoon: function() {
    this.setState({view: 'coming-soon'});
  },

  render: function() {
    return <div>
      {this.getContent()}
    </div>;
  }
});

module.exports = Upgrade;