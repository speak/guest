var _ = require('underscore');
var React = require('react');
var Flux = require('delorean').Flux;

var Api = require('../libs/api');
var Bulldog = require('../libs/bulldog');

var UsersStore = require('../stores/users-store');

var ChannelInfo = require('./channel-info');
var AudioOutput = require('./audio-output');
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
    var app = this.getStore('appStore');
    var auth = this.getStore('authStore');
    var channel = this.getStore('channelStore');
    var users = this.getStore('usersStore');
    
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
    
    if (app.permission_dialog) {
      return <div id="app">
        Accept camera and mic permissions
      </div>
    }
    
    if (app.call_completed && !UsersStore.otherUsers().length) {
      return <div id="app">
        Looks like the call is over!
      </div>
    }
    
    return <div id="app">
      <Users users={users} />
      <AudioOutput streamId={app.stream} />
    </div>
  }
});

module.exports = App;
