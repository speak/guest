var React = require('react');
var UserActions = require('../actions/user-actions');
var UsersStore = require('../stores/users-store');
var Analytics = require('../libs/analytics');
var Formsy = require('formsy-react');
var Input = require('./input');

var Recording = React.createClass({
  
  getInitialState: function() {
    return {
      email: UsersStore.getCurrentUser().email, 
      can_submit: false
    }
  },

  enableButton: function () {
    this.setState({
      can_submit: true
    });
  },

  disableButton: function () {
    this.setState({
      can_submit: false
    });
  },

  handleSubmit: function(data, reset, invalidate) {
    Analytics.track('interest.recording', data);
    UserActions.closeModal();
  },
  
  componentDidMount: function() {
    Analytics.track('clicked.record');
  },

  render: function() {
    return <div id="recording" className="centered">
      <h2>Recording coming soon!</h2>
      <p>We&#39;re working hard on building out recording, submit your email and 
      we&#39;ll let you know as soon as it&#39;s ready!</p>
      
      <Formsy.Form onValidSubmit={this.handleSubmit} onValid={this.enableButton} onInvalid={this.disableButton}>
        <Input value={this.state.email} type="email" name="email" placeholder="Email address" />
        <input type="submit" value="Submit" disabled={!this.state.can_submit} className="button primary" />
      </Formsy.Form>
    </div>;
  }
});

module.exports = Recording;