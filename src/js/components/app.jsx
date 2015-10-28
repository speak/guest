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

  watchStores: ['authStore', 'organizationsStore', 'appStore'],

  componentDidMount: function(){
    var auth = this.getStore('authStore');
    console.log("app mounted")
    console.log(auth)
    if(auth.token) {
      Bulldog.createSessionFromToken(auth.token)
    }
  },
  
  render: function() {
    var auth = this.getStore('authStore');
    var orgs = this.getStore('organizationsStore');
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
          <ChannelInfo />
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
