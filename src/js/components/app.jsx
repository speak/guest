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
    
    // TODO: we'll tidy all this logic up soon
    if (!channel.id) {
      return <Loading />;
    }

    if (!auth.token) {
      return <div>
        <ChannelInfo path={channel.path} />
        <Signin channel={channel} />
      </div>
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
    var modal = this.getModal();
    
    if (modal) {
      modal = <div id="modal-wrapper">
        <div id="modal" className="animated fadeIn">{modal}</div>
      </div>;
    }
    
    if (!modal && !UsersStore.otherUsers().length) {
      modal = <div className="notice">Waiting for someone to join</div>;
    }

    return <div id="app">
      <AudioOutput streamId={app.stream} />
      <Users users={users} />
      {modal}
    </div>
  }
});

module.exports = App;
