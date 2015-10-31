var React = require('react');
var DocumentTitle = require('react-document-title');
var AuthActions = require('../actions/auth-actions');

var Signin = React.createClass({
  
  getInitialState: function() {
    return {
      saving: false
    }
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

    AuthActions.create({
      first_name: this.refs.first_name.getDOMNode().value,
      email: this.refs.email.getDOMNode().value,
      guest: true
    }, {
      error: function() {
        // TODO: handle account already exists
      }
    });
  },
  
  reset: function() {
    this.setState({saving: false});
  },

  render: function() {
    var heading = this.getHeading();
    var name;
    
    if (this.props.channel.guest) {
      name = <input type="text" ref="channel_name" placeholder="Meeting Name" className="optional" />;
    }
    
    return <DocumentTitle title={heading}>
      <form onSubmit={this.handleSubmit}>
        <h2>{heading}</h2>
        <input type="text" ref="first_name" placeholder="First Name" />
        <input type="email" ref="email" placeholder="Email" className="optional" />
        {name}
        <input type="submit" value={this.getButtonText()} />
      </form>
    </DocumentTitle>;
  }
});

module.exports = Signin;
