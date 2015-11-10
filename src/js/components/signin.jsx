var React = require('react');
var DocumentTitle = require('react-document-title');
var Api = require('../libs/api');
var AuthActions = require('../actions/auth-actions');
var BulldogActions = require('../actions/bulldog-actions');
var Config = require('config');
var Formsy = require('formsy-react');
var Input = require('./input');
var $ = require('jquery');
var _ = require('underscore');

var Signin = React.createClass({
  
  getInitialState: function() {
    return {
      can_submit: false,
      authentication_required: false,
      preferred_server: null
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

  componentDidMount: function() {
    $.get(Config.hosts.twoface + '/status', this.gotPreferredIp);
  },
  
  componentDidUpdate: function(prevProps, prevState) {
    if (this.state.authentication_required && !prevState.authentication_required) {
      $('input[name=password').focus();
    }
  },
  
  gotPreferredIp: function(data) {
    this.setState({preferred_server: data.ip});
  },
  
  getHeading: function() {
    var channel = this.props.channel;
    
    if (!channel.id) {
      return "Start a Meeting";
    }
    
    // TODO: Use participant names here
    return "Join " + (channel.name || "Meeting");
  },
  
  getButtonText: function() {
    return this.props.channel.guest ? "Start Meeting" : "Join Meeting";
  },

  handleSubmit: function(data, reset, invalidate) {
    this.setState({can_submit: false});

    if (data.password) {
      AuthActions.signin(data, {
        error: function(xhr, data){
          this.handleError(xhr, data, invalidate);
        }.bind(this)
      });
    } else {
      data.server = this.state.preferred_server;
      data.guest = true;
      AuthActions.create(data, {
        success: function(response){
          response.channel_name = data.channel_name,
          BulldogActions.signedIn(response);
        }.bind(this),
        error: function(xhr, data){
          this.handleError(xhr, data, invalidate);
        }.bind(this)
      });
    }
  },
  
  handleError: function(xhr, data, invalidate) {
    if (xhr.status == 403) {
      this.setState({
        authentication_required: true, 
        can_submit: true
      });
    } else {
      var invalid = {};
      invalid[data.params.param] = data.params.message;
      invalidate(invalid);
      this.setState({can_submit: true});
    }
  },

  render: function() {
    var heading = this.getHeading();
    var name, password;
    
    if (!this.props.channel.id) {
      name = <Input type="text" name="channel_name" placeholder="Meeting Name" className="u-full-width" />;
    }
    
    if (this.state.authentication_required) {
      password = <Input type="password" name="password" placeholder="Password" className="u-full-width" />;
    }

    return <DocumentTitle title={heading}>
      <div>
        <Formsy.Form onValidSubmit={this.handleSubmit} onValid={this.enableButton} onInvalid={this.disableButton}>
          <h2>{heading}</h2>
          <Input type="text" name="first_name" placeholder="Your name" className="u-full-width" />
          <Input type="email" name="email" placeholder="Email" className="u-full-width" />
          {password}
          {name}
          <input type="submit" value={this.getButtonText()} disabled={!this.state.can_submit} className="u-full-width button primary" />
        </Formsy.Form>
      </div>
    </DocumentTitle>;
  }
});

module.exports = Signin;
