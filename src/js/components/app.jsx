var _ = require('underscore');
var React = require('react');
var Flux = require('delorean').Flux;

var Api = require('../libs/api');
var Bulldog = require('../libs/bulldog');

var UsersStore = require('../stores/users-store');

var ChannelInfo = require('./channel-info');
var Signin = require('./signin');
var Users = require('./users');

var App = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['authStore', 'appStore', 'channelStore', 'usersStore'],

  componentDidMount: function(){
    var auth = this.getStore('authStore');
    if(auth.token) {
      Bulldog.createSessionFromToken(auth.token)
    }
  },
  
  render: function() {
    var auth = this.getStore('authStore');
    var channel = this.getStore('channelStore');

    if (!channel.id) {
      return <div id="app">
        Loading...
      </div>
    }

    if (!auth.token) {
      return <div id="app">
        <ChannelInfo path={channel.path} />
        <Signin channel={channel} />
      </div>
    }
    
    return <div id="app">
      <Users users={UsersStore.otherUsers()} />
    </div>
  }
});

module.exports = App;
