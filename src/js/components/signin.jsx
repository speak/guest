var React = require('react');
var DocumentTitle = require('react-document-title');
var Api = require('../libs/api');
var AuthActions = require('../actions/auth-actions');
var UserActions = require('../actions/user-actions');
var Utilities = require('../libs/utilities');
var Config = require('config');
var Formsy = require('formsy-react');
var Input = require('./input');
var $ = require('jquery');
var _ = require('underscore');

var Signin = React.createClass({
  
  getInitialState: function() {
    return {
      can_submit: false,
      password_required: false,
      defaults: {}
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
  
  componentWillMount: function() {
    var params = Utilities.getQueryParams();
    
    this.setState({defaults: params});
  },
  
  componentDidUpdate: function(prevProps, prevState) {
    if (this.state.password_required && !prevState.password_required) {
      $('input[name=password').focus();
    }
  },
  
  getHeading: function() {
    var channel = this.props.channel;
    var subtext = "Just add your name below to join the call."
    
    if (!channel.id) {
      return <h2>Start a Call</h2>;
    }
    
    if (channel.locked) {
      subtext = "This call has been locked with a secret code, you'll need to enter it to join.";
    }
    
    // TODO: Use participant names here
    return <div>
      <h2>{channel.name || "Join Call"}</h2>
      <p>{subtext}</p>
    </div>;
  },
  
  getText: function() {
    return this.props.channel.guest ? "Start Call" : "Join Call";
  },

  handleSubmit: function(data, reset, invalidate) {
    this.setState({can_submit: false});

    if (this.props.authenticated) {
      if (this.props.channel.id) {
        UserActions.channelUpdated({
          password: data.secret
        })
      } else {
        UserActions.channelCreate({
          name: data.channel_name
        });
      }
      
    } else if (data.password) {
      AuthActions.signin(data, {
        error: function(xhr, data){
          this.handleError(xhr, data, invalidate);
        }.bind(this)
      });
    } else {
      
      if (data.first_name) {
        var name_parts = data.first_name.split(" ");
        if (name_parts.length > 1) {
          data.last_name = name_parts.pop();
          data.first_name = name_parts.join(' ');
        }
      }
      
      UserActions.channelUpdated({name: data.channel_name, password: data.secret});
      AuthActions.createUser(data).fail(function(){
        // TODO
      });
    }
  },
  
  handleError: function(xhr, data, invalidate) {
    if (xhr.status == 403) {
      this.setState({
        password_required: true, 
        can_submit: true
      });
    } else {
      invalidate(data.params);
      this.setState({can_submit: true});
    }
  },

  render: function() {
    var heading = this.getHeading();
    var channel_name, password, email, name, secret;
    
    if (this.props.channel.locked) {
      secret = <div className="secret-code">
        <Input type="password" name="secret" placeholder="Secret Code" className="u-full-width" autoComplete="off" />;
      </div>
    }
    
    if (!this.props.channel.id) {
      channel_name = <Input value={this.state.defaults.channel_name} type="text" name="channel_name" placeholder="Meeting Name" className="u-full-width" wrapperClass="optional" />;
    }
    
    if (!this.props.authenticated) {
      name = <Input value={this.state.defaults.name} type="text" name="first_name" placeholder="Your name" className="u-full-width" />;
      email = <Input value={this.state.defaults.email} type="email" name="email" placeholder="Email" className="u-full-width" wrapperClass="optional" />;
    }
    
    if (this.state.password_required) {
      password = <Input notice="Please enter your password to login to your Speak account" type="password" name="password" placeholder="Password" className="u-full-width" />;
    }

    return <DocumentTitle title={this.getText()}>
      <div id="floating-modal" className="signin">
        {heading}
        <Formsy.Form onValidSubmit={this.handleSubmit} onValid={this.enableButton} onInvalid={this.disableButton}>
          <div className="inputs">
            {name}
            {email}
            {password}
            {channel_name}
            {secret}
          </div>
          <input type="submit" value={this.getText()} disabled={!this.state.can_submit} className="u-full-width button primary" />
        </Formsy.Form>
      </div>
    </DocumentTitle>;
  }
});

module.exports = Signin;
