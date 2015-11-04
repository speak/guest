var React = require('react');
var Flux = require('delorean').Flux;

var UsersStore = require('../stores/users-store');
var UserActions = require('../actions/user-actions');
var CallCompleted = require('./call-completed');
var PermissionError = require('./permission-error');
var PermissionDialog = require('./permission-dialog');
var Loading = require('./loading');
var ChannelInfo = require('./channel-info');
var AudioOutput = require('./audio-output');
var Signin = require('./signin');
var Users = require('./users');
var _ = require('underscore');

var App = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['authStore', 'appStore', 'channelStore', 'usersStore'],

  getModal: function() {
    var app = this.getStore('appStore');
    var auth = this.getStore('authStore');
    var channel = this.getStore('channelStore');
    
    if (!auth.token) {
      return <Signin channel={channel} />;
    }
    
    if (app.permission_denied) {
      return <PermissionError />;
    }

    if (app.permission_dialog) {
      return <PermissionDialog />;
    }
    
    if (!app.permission_granted) {
      return <Loading />;
    }

    if (app.call_completed && !UsersStore.otherUsers().length) {
      return <CallCompleted />;
    }

    return null;
  },

  render: function() {
    var app = this.getStore('appStore');
    var users = this.getStore('usersStore');
    var channel = this.getStore('channelStore');
    var other_users = UsersStore.otherUsers();
    var modal = this.getModal();
    
    if (modal) {
      modal = <div id="modal-wrapper">
        <ChannelInfo path={channel.path} />
        <div id="modal" className="animated fadeIn">{modal}</div>
      </div>;
    }
    
    if (!modal && !other_users.length) {
      modal = <div id="modal-wrapper">
        <ChannelInfo path={channel.path} />
      </div>;
    }

    return <div id="app">
      <AudioOutput streamId={app.stream} />
      <Users users={users} />
      {modal}
    </div>
  }
});

module.exports = App;
