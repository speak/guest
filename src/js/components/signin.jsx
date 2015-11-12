var React = require('react');
var DocumentTitle = require('react-document-title');
var Api = require('../libs/api');
var AuthActions = require('../actions/auth-actions');
var UserActions = require('../actions/user-actions');
var BulldogActions = require('../actions/bulldog-actions');
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
      preferred_server: null,
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

  componentDidMount: function() {
    $.get(Config.hosts.twoface + '/status', this.gotPreferredIp);
  },
  
  componentDidUpdate: function(prevProps, prevState) {
    if (this.state.password_required && !prevState.password_required) {
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

    if (this.props.authenticated) {
      UserActions.channelCreate({
        public: true,
        name: data.channel_name
      });
      
    } else if (data.password) {
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
        },
        error: function(xhr, data){
          this.handleError(xhr, data, invalidate);
        }.bind(this)
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
      var invalid = {};
      invalid[data.params.param] = data.params.message;
      invalidate(invalid);
      this.setState({can_submit: true});
    }
  },

  render: function() {
    var heading = this.getHeading();
    var channel_name, password, email, name;
    
    if (!this.props.channel.id) {
      channel_name = <Input value={this.state.defaults.channel_name} type="text" name="channel_name" placeholder="Meeting Name" className="u-full-width" />;
    }
    
    if (!this.props.authenticated) {
      name = <Input value={this.state.defaults.name} type="text" name="first_name" placeholder="Your name" className="u-full-width" />;
      email = <Input value={this.state.defaults.email} type="email" name="email" placeholder="Email" className="u-full-width" />;
    }
    
    if (this.state.password_required) {
      password = <Input type="password" name="password" placeholder="Password" className="u-full-width" />;
    }

    return <DocumentTitle title={heading}>
      <div>
        <Formsy.Form onValidSubmit={this.handleSubmit} onValid={this.enableButton} onInvalid={this.disableButton}>
          <h2>{heading}</h2>
          {name}
          {email}
          {password}
          {channel_name}
          <input type="submit" value={this.getButtonText()} disabled={!this.state.can_submit} className="u-full-width button primary" />
        </Formsy.Form>
      </div>
    </DocumentTitle>;
  }
});

module.exports = Signin;
