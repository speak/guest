var React = require('react');
var Flux = require('delorean').Flux;
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var DocumentTitle = require('react-document-title');

var UsersStore = require('../stores/users-store');
var UserActions = require('../actions/user-actions');
var CallCompleted = require('./call-completed');
var PermissionError = require('./permission-error');
var PermissionDialog = require('./permission-dialog');
var Incompatible = require('./incompatible');
var Connecting = require('./connecting');
var Modal = require('./modal');
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
    var highlighted_user = UsersStore.getHighlightedUser();
    var authenticated = app.socks && app.has_configuration;
    
    if (highlighted_user) return null;
    
    if (app.incompatible) {
      return <Incompatible />
    }

    if (!auth.token || (!channel.id && authenticated)) {
      return <Signin channel={channel} authenticated={authenticated} />;
    }
    
    if (app.permission_denied) {
      return <PermissionError />;
    }

    if (app.permission_dialog) {
      return <PermissionDialog key="dialog" />;
    }
    
    if (!app.permission_granted || !app.stream) {
      return <Connecting />;
    }

    if (channel.id && !other_users.length) {
      if (channel.completed) {
        return <CallCompleted key="completed" />;
      }
      var waiting = channel.created_by_id && channel.created_by_id != app.user_id;
      return <ChannelShare path={channel.path} waiting={waiting} key="share" />;
    }

    return null;
  },

  getContent: function() {
    var app = this.getStore('appStore');
    var users = UsersStore.getOnlineUsers();
    var auth = this.getStore('authStore');
    var channel = this.getStore('channelStore');
    var user = UsersStore.getCurrentUser();
    var message = this.getMessage();
    var logo = <a href="https://speak.io" target="_blank" className="logo"></a>;
    var video, chat, modal;
    
    if (user && channel.id && app.permission_granted) {
      video = <Video users={users} user={user} channel={channel} />;
      chat = <Chat typing={app.typing} />;
    }

    if (app.modal) {
      modal = <Modal user={user} channel={channel} name={app.modal} />;
      message = null;
    } else {
      message = <ReactCSSTransitionGroup transitionName="fade" transitionEnterTimeout={250} transitionLeaveTimeout={250} id="message-wrapper">{message}</ReactCSSTransitionGroup>;
    }
    
    if (app.app) {
      return <div id="app">
        <AudioOutput streamId={app.stream} />
        {video}
        {chat}
        {message}
        {logo}
        {modal}
      </div>;
    } else {
      return <div id="app">
        {message}
        {logo}
      </div>;
    }
  },
  
  render: function() {
    var app = this.getStore('appStore');
    var channel = this.getStore('channelStore');
    var title = "Speak";
    
    if (channel && channel.name) {
      title = channel.name;
    }
    
    return <DocumentTitle title={title}>
      <div id="app">{this.getContent()}</div>
    </DocumentTitle>;
  }
});

module.exports = App;
