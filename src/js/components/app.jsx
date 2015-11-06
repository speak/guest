var React = require('react');
var Flux = require('delorean').Flux;

var UsersStore = require('../stores/users-store');
var UserActions = require('../actions/user-actions');
var AppActions = require('../actions/app-actions');
var CallCompleted = require('./call-completed');
var PermissionError = require('./permission-error');
var PermissionDialog = require('./permission-dialog');
var Connecting = require('./connecting');
var ChannelInfo = require('./channel-info');
var AudioOutput = require('./audio-output');
var Signin = require('./signin');
var Video = require('./video');
var _ = require('underscore');

var App = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['authStore', 'appStore', 'channelStore', 'usersStore'],

  getMessage: function() {
    var app = this.getStore('appStore');
    var auth = this.getStore('authStore');
    var channel = this.getStore('channelStore');
    var other_users = UsersStore.otherUsers();
    
    if (channel.highlighted_user_id) return null;
    
    if (!auth.token) {
      return <div id="modal" className="animated fadeIn">
        <Signin channel={channel} />
      </div>;
    }
    
    if (app.permission_denied) {
      return <PermissionError />;
    }

    if (app.permission_dialog) {
      return <PermissionDialog />;
    }
    
    if (!app.permission_granted) {
      return <Connecting />;
    }

    if (channel.id && !other_users.length) {
      if (app.call_completed) {
        return <CallCompleted />;
      }
      return <ChannelInfo path={channel.path} />;
    }

    return null;
  },

  
  signOut: function(){
    AppActions.signOut();
  },

  render: function() {
    var app = this.getStore('appStore');
    var users = this.getStore('usersStore');
    var channel = this.getStore('channelStore');
    var auth = this.getStore('authStore');
    var user = UsersStore.getCurrentUser();
    var message = this.getMessage();
    var sessionLink, video;

    if (auth.token) {
      sessionLink = <a onClick={this.signOut}>Logout</a>;
    }
    
    if (user && channel && app.permission_granted) {
      video = <Video users={users} user={user} channel={channel} />;
    }

    return <div id="app">
      <AudioOutput streamId={app.stream} />
      {video}
      <div id="modal-wrapper">{message}</div>
      <a href="https://speak.io" target="_blank" className="logo"></a>
      {sessionLink}
    </div>
  }
});

module.exports = App;
