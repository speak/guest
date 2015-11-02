var React = require('react');
var DocumentTitle = require('react-document-title');
var AuthActions = require('../actions/auth-actions');
var Config = require('config');
var $ = require('jquery-browserify');

var Signin = React.createClass({
  
  getInitialState: function() {
    return {
      saving: false,
      authentication_required: false,
      preferred_server: null
    }
  },
  
  componentDidMount: function() {
    $.get(Config.hosts.twoface + '/status', this.gotPreferredIp);
  },
  
  gotPreferredIp: function(data) {
    this.setState({preferred_server: data.ip});
  },
  
  getHeading: function() {
    var channel = this.props.channel;
    
    if (channel.guest) {
      return "Start a Meeting";
    }
    
    // TODO: Use participant names here
    return "Join " + (channel.name || "Meeting");
  },
  
  getButtonText: function() {
    return this.props.channel.guest ? "Start Meeting" : "Join Meeting";
  },

  handleSubmit: function(ev) {
    ev.preventDefault();
    this.setState({saving: true});

    if (this.refs.password) {
      AuthActions.signin({
        email: this.refs.email.value,
        password: this.refs.password.value
      });
    } else {
      AuthActions.create({
        first_name: this.refs.first_name.value,
        email: this.refs.email.value,
        server: this.state.preferred_server,
        guest: true
      }, {
        error: this.handleError
      });
    }
  },
  
  handleError: function(xhr) {
    if (xhr.status == 403) {
      this.setState({authentication_required: true});
    } else {
      // TODO: real error
    }
  },
  
  reset: function() {
    this.setState({saving: false});
  },

  render: function() {
    var heading = this.getHeading();
    var name, password;
    
    if (this.props.channel.guest) {
      name = <input type="text" ref="channel_name" placeholder="Meeting Name" className="optional" />;
    }
    
    if (this.state.authentication_required) {
      password = <input type="password" ref="password" placeholder="Password" />;
    }
    
    return <DocumentTitle title={heading}>
      <form onSubmit={this.handleSubmit}>
        <h2>{heading}</h2>
        <input type="text" ref="first_name" placeholder="First Name" />
        <input type="email" ref="email" placeholder="Email" className="optional" />
        {password}
        {name}
        <input type="submit" value={this.getButtonText()} />
      </form>
    </DocumentTitle>;
  }
});

module.exports = Signin;
