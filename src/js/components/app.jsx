var React = require('react');
var Flux = require('delorean').Flux;

var UsersStore = require('../stores/users-store');
var UserActions = require('../actions/user-actions');
var PermissionError = require('./permission-error');
var PermissionDialog = require('./permission-dialog');
var Loading = require('./loading');
var ChannelInfo = require('./channel-info');
var AudioOutput = require('./audio-output');
var Signin = require('./signin');
var Video = require('./video');
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

    return null;
  },

  render: function() {
    var app = this.getStore('appStore');
    var users = this.getStore('usersStore');
    var channel = this.getStore('channelStore');
    var other_users = UsersStore.otherUsers();
    var user = UsersStore.getCurrentUser();
    var modal = this.getModal();
    
    if (modal) {
      modal = <div id="modal-wrapper">
        <div id="modal" className="animated fadeIn">{modal}</div>
      </div>;
    }
    
    if (!modal && !other_users.length && !channel.highlighted_user_id) {
      modal = <div id="modal-wrapper">
        <ChannelInfo path={channel.path} />
      </div>;
    }

    return <div id="app">
      <AudioOutput streamId={app.stream} />
      <Video users={users} user={user} channel={channel} />
      {modal}
      <a href="https://speak.io" target="_blank" className="logo"></a>
    </div>
  }
});

module.exports = App;
