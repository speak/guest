var React = require('react');
var Flux = require('delorean').Flux;
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
      <ul>
        <li><a onClick={this.logout}>Logout</a></li>
      </ul>
    </header>;
  }
});

module.exports = Header;
