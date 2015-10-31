var React = require('react');
var Flux = require('delorean').Flux;
var Header = require('./header');
var ChannelInfo = require('./channel-info');
var Login = require('./login');
var Api = require('../libs/api');
var Bulldog = require('../libs/bulldog');
var DocumentTitle = require('react-document-title');
var _ = require('underscore');

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
        {auth.token ? <Header /> : null}
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
