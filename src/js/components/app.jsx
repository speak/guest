var _ = require('underscore');
var React = require('react');
var Flux = require('delorean').Flux;

var Api = require('../libs/api');
var Bulldog = require('../libs/bulldog');

var UsersStore = require('../stores/users-store');

var DocumentTitle = require('react-document-title');
var Header = require('./header');
var ChannelInfo = require('./channel-info');
var Login = require('./login');
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
    var pageContent;

    if(auth.token) {
      pageContent = (
      <div id="app">
        <Header />
        <Users users={UsersStore.otherUsers()} />
      </div>
      )
    } else {
      pageContent = (
        <div id="app">
          <ChannelInfo name={channel.name} path={channel.path} />
          <Login />
        </div>
      )
    }
    
    return <DocumentTitle title='Account'>
      {pageContent}
    </DocumentTitle>;
  }
});

module.exports = App;
