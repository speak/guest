var React = require('react');
var Config = require('config');
var UserActions = require('../actions/user-actions');
var UsersStore = require('../stores/users-store');
var Analytics = require('../libs/analytics');
var Formsy = require('formsy-react');
var Input = require('./input');

var ChannelLock = React.createClass({
  getInitialState: function() {
    return {
      can_submit: false
    }
  },

  enableButton: function() {
    this.setState({
      can_submit: true
    });
  },

  disableButton: function() {
    this.setState({
      can_submit: false
    });
  },

  handleLock: function(data, reset, invalidate) {
    this.disableButton();
    
    UserActions.channelLock(data).done(function(){
      UserActions.closeModal();
    }).fail(function(data) {
      invalidate({
        password: data.responseJSON.error
      });
    });
  },

  handleUnlock: function(data, reset, invalidate) {
    this.disableButton();
    
    UserActions.channelUnlock(data).done(function(){
      UserActions.closeModal();
    }).fail(function(data) {
      invalidate({
        password: data.responseJSON.error
      });
    });
  },

  render: function() {
    if (this.props.locked) {
      return <div id="channel-lock" className="centered">
        <h2>Unlock Channel</h2>
        <p>This channel is current locked, meaning that others need the password to join&hellip;</p>
        <Formsy.Form onValidSubmit={this.handleUnlock} onValid={this.enableButton} onInvalid={this.disableButton}>
          <Input type="password" name="password" placeholder="Password" autoComplete="off" />
          <input type="submit" value={this.state.can_submit ? "Unlock" : "Just a second..."} disabled={!this.state.can_submit} className="button primary" />
        </Formsy.Form>
      </div>;
    } else {
      return <div id="channel-lock" className="centered">
        <h2>Lock Channel</h2>
        <p>Got something private to say? Locking the channel will mean that others need the password to join&hellip;</p>
        <Formsy.Form onValidSubmit={this.handleLock} onValid={this.enableButton} onInvalid={this.disableButton}>
          <Input type="password" name="password" placeholder="Password" autoComplete="off" />
          <input type="submit" value={this.state.can_submit ? "Lock" : "Just a second..."} disabled={!this.state.can_submit} className="button primary" />
        </Formsy.Form>
      </div>;
    }
  }
});

module.exports = ChannelLock;
