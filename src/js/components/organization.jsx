var React = require('react');
var Flux = require('delorean').Flux;
var DocumentTitle = require('react-document-title');
var Api = require('../libs/api');
var $ = require('jquery-browserify');

var Organization = React.createClass({

  mixins: [Flux.mixins.storeListener],

  watchStores: ['organizationsStore'],

  submitForm: function(ev) {
    ev.preventDefault();
    var data = {
      name:$(this.refs.name.getDOMNode()).val()
    };
    Api.organizationUpdate(this.props.params.id, data)
  },


  render: function() {
    var orgs = this.getStore('organizationsStore')
    var org = orgs[this.props.params.id]
    if(org) {
      return <DocumentTitle title={org.name}>
      <div>
      <h2>{org.name}</h2>
      <p>Update your organization's details</p>
      <div>
      <label for="name">Name</label>
        <input ref="name" name="name" type="text" defaultValue={org.name} />
      </div>
      <div>
      <label for="email">Contact email</label>
        <input ref="email" name="name" type="email" />
      </div>
      <div>
      <label for="telephone">Name</label>
          <input ref="telephone" name="telephone" type="text" />
        </div>
        <div>
          <input type="submit" onClick={this.submitForm} />
        </div>
      </div>
      </DocumentTitle>;
    }
    return null;
  }
});

module.exports = Organization;
