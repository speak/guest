var React = require('react');
var Flux = require('delorean').Flux;
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var DocumentTitle = require('react-document-title');

var UsersStore = require('../stores/users-store');
var UserActions = require('../actions/user-actions');
var CallCompleted = require('./call-completed');
var PermissionError = require('./permission-error');
var PermissionDialog = require('./permission-dialog');
var Connecting = require('./connecting');
var Chat = require('./chat');
var ChannelShare = require('./channel-share');
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
      return <Signin channel={channel} />;
    }
    
    if (app.permission_denied) {
      return <PermissionError />;
    }

    if (app.permission_dialog) {
      return <PermissionDialog key="dialog" />;
    }
    
    if (!app.permission_granted) {
      return <Connecting />;
    }

    if (channel.id && !other_users.length) {
      if (app.call_completed) {
        return <CallCompleted key="completed" />;
      }
      return <ChannelShare path={channel.path} key="share" />;
    }

    return null;
  },

  render: function() {
    var app = this.getStore('appStore');
    var users = UsersStore.getOnlineUsers();
    var auth = this.getStore('authStore');
    var channel = this.getStore('channelStore');
    var user = UsersStore.getCurrentUser();
    var message = this.getMessage();
    var video, chat, title;

    if (user && channel && app.permission_granted) {
      video = <Video users={users} user={user} channel={channel} />;
      chat = <Chat typing={app.typing} />;
    }

    if (channel) {
      title = <DocumentTitle title={channel.name} />
    }

    return <div id="app">
      {title}
      <AudioOutput streamId={app.stream} />
      {video}
      {chat}
      <ReactCSSTransitionGroup transitionName="fade" transitionAppear={true} transitionAppearTimeout={250} id="modal-wrapper">{message}</ReactCSSTransitionGroup>
      <a href="https://speak.io" target="_blank" className="logo"></a>
    </div>
  }
});

module.exports = App;
