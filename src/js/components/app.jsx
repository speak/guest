var React = require('react');
var Flux = require('delorean').Flux;
var Header = require('./header');
var Navigation = require('./navigation');
var OrganizationsSelect = require('./organizations-select');
var Api = require('../libs/api');
var DocumentTitle = require('react-document-title');
var _ = require('underscore');

var App = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['authStore', 'organizationsStore', 'appStore'],

  componentDidMount: function(){
    var auth = this.getStore('authStore');
    if(auth.token){
      Api.configure();
    }
  },
  
  render: function() {
    var auth = this.getStore('authStore');
    var orgs = this.getStore('organizationsStore');
    
    return <DocumentTitle title='Account'>
      <div id="app">
        {auth.token ? <Header /> : null}
        {auth.token ? <OrganizationsSelect organizations={_.values(orgs)} /> : null}
        {auth.token ? <Navigation /> : null}
        <section>{this.props.children}</section>
      </div>
    </DocumentTitle>;
  }
});

module.exports = App;
