var React = require('react');
var Flux = require('delorean').Flux;
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var Navigation = React.createClass({

  mixins: [Flux.mixins.storeListener],

  watchStores: ['appStore'],

  render: function() {
    if(this.getStore('appStore').organization_id) {
    return (
    <nav className="sidebar">
      <ul>
        <li><Link to={"/team/" + this.getStore('appStore').organization_id + "/details"}>Details</Link></li>
        <li><Link to={"/team/" + this.getStore('appStore').organization_id + "/integrations"}>Integrations</Link></li>
        <li><Link to={"/team/" + this.getStore('appStore').organization_id + "/billing"}>Billing</Link></li>
      </ul>
    </nav>);
    }
    return null;
  }
});

module.exports = Navigation;
