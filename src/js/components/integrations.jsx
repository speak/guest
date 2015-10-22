var React = require('react');
var Flux = require('delorean').Flux;
var DocumentTitle = require('react-document-title');
var Api = require('../libs/api');
var $ = require('jquery-browserify');

var Integrations = React.createClass({

  mixins: [Flux.mixins.storeListener],

  watchStores: ['organizationsStore'],

  submitForm: function(ev) {
    ev.preventDefault();
    var data = {
      slack_slash_token:$(this.refs.slack_slash_token.getDOMNode()).val()
    };
    Api.organizationUpdate(this.props.params.id, data)
  },

  render: function() {
    var orgs = this.getStore('organizationsStore')
    var org = orgs[this.props.params.id]
    if(org) {
    return <DocumentTitle title={'Integrations'}>
    <div>
      <h2>Integrations</h2>
      <div>
        <label for="name">Slack Token</label>
        <input ref="slack_slash_token" name="slack_slash_token" type="text" defaultValue={org.slack_slash_token} />
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

module.exports = Integrations;
