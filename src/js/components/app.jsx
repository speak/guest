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
var Participants = require('./participants');
var Modal = require('./modal');
var Chat = require('./chat');
var ChannelShare = require('./channel-share');
var AudioOutput = require('./audio-output');
var Signin = require('./signin');
var Video = require('./video');
var Logo = require('./logo');
var fullscreen = require('screenfull');
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

    if ((!auth.token && !channel.loading) || (auth.token && channel.not_found && !channel.id && !channel.loading)) {
      return <div>
        <Signin channel={channel} authenticated={authenticated} />
        <Participants users={other_users} />
      </div>;
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

  handleDoubleClick: function(ev) {
    if (fullscreen.enabled) {
      fullscreen.toggle(window.document.body);
    }
  },

  getContent: function() {
    var app = this.getStore('appStore');
    var users = UsersStore.getOnlineUsers();
    var auth = this.getStore('authStore');
    var channel = this.getStore('channelStore');
    var user = UsersStore.getCurrentUser();
    var message = this.getMessage();
    var video, chat, modal, current;
    
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
      return <div onDoubleClick={this.handleDoubleClick}>
        <AudioOutput streamId={app.stream} />
        {video}
        {chat}
        {message}
        <ReactCSSTransitionGroup transitionName="zoom" transitionEnterTimeout={150} transitionLeaveTimeout={150}>{modal}</ReactCSSTransitionGroup>
      </div>;
    }
    
    return message;
  },
  
  render: function() {
    var app = this.getStore('appStore');
    var channel = this.getStore('channelStore');
    var title = "Speak";
    
    if (channel && channel.name) {
      title = channel.name;
    }
    
    return <DocumentTitle title={title}>
      <div id="app" className={app.user_id ? 'authenticated' : ''}>
        {this.getContent()}
        <Logo />
      </div>
    </DocumentTitle>;
  }
});

module.exports = App;
