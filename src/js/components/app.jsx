var React = require('react');
var Flux = require('delorean').Flux;

var UsersStore = require('../stores/users-store');
var UserActions = require('../actions/user-actions');
var CallCompleted = require('./call-completed');
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
      return <div>
        Loading...
      </div>
    }

    if (!auth.token) {
      return <div>
        <ChannelInfo path={channel.path} />
        <Signin channel={channel} />
      </div>
    }
    
    if (app.permission_denied) {
      return <div>
        Sorry, you blocked camera and mic access but these are needed to use Speak!
      </div>
    }

    if (app.permission_dialog) {
      return <div>
        Accept camera and mic permissions
      </div>
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
      modal = <div id="modal" className="animated fadeIn">{modal}</div>;
    }
      
    return <div id="app">
      <AudioOutput streamId={app.stream} />
      <Users users={users} />
      {modal}
    </div>
  }
});

module.exports = App;
