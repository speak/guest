var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var DocumentTitle = require('react-document-title');
var AuthActions = require('../actions/auth-actions');

var Login = React.createClass({
  
  getInitialState: function() {
    return {
      saving: false
    }
  },

  handleSubmit: function(ev) {
    ev.preventDefault();
    this.setState({saving: true});

    AuthActions.create({
      first_name: this.refs.first_name.getDOMNode().value,
      last_name: this.refs.last_name.getDOMNode().value,
      email: this.refs.email.getDOMNode().value,
      guest: true
    });
  },

  render: function() {
    return <DocumentTitle title='Login'>
      <form onSubmit={this.handleSubmit}>
        <p>Login already</p>
        <input type="text" ref="first_name" placeholder="First Name" />
        <input type="text" ref="last_name" placeholder="Last Name" />
        <input type="email" ref="email" placeholder="Email" />
        <input type="submit" value="Login" />
      </form>
    </DocumentTitle>;
  }
});

module.exports = Login;
