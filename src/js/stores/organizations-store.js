var Store =  require('./store');
var _ = require('underscore');

var OrganizationsStore = new Store({

  actions: {
    'app.configured': 'reset',
    'organization.updated': 'update'
  },

  reset: function(data) {
    var self = this;
    this.state = {};

    // normalize
    _.each(data.organizations, function(organization){
      self.state[organization.id] = {
        id: organization.id,
        name: organization.name,
        server: organization.server,
        is_slack_team: organization.is_slack_team,
        invite_url: organization.invite_url
      };
    });
    this.emit('change');
  },

  update: function(id, props) {
    // allows passing all parameters as an object in first parameter
    if (id && typeof id == 'object') {
      props = _.clone(id);
      id = props.id;
    }

    this.state[id] = _.extend((this.state[id] || {}), props);
    this.emit('change');
    return this.state[id];
  }

});

module.exports = OrganizationsStore;

