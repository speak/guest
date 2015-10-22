var React = require('react');
var Flux = require('delorean').Flux;
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var AuthActions = require('../actions/auth-actions')

var Header = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['authStore'],

  logout: function(ev){
    ev.preventDefault();
    AuthActions.signout();
  },
  
  render: function() {
    var auth = this.getStore('authStore');
    
    return <header>
      <Link to="/" className="logo"><img src="/images/logo-white.png" width="80" height="26" /></Link>
      <ul>
        <li>{auth.token ? <a onClick={this.logout}>Logout</a> : <Link to="/login">Login</Link>}</li>
      </ul>
    </header>;
  }
});

module.exports = Header;