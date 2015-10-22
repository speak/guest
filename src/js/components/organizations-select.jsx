var React = require('react');
var _ = require('underscore');
var SelectInput = require('./select-input');


var OrganizationsSelect = React.createClass({
  getSelectOptions: function() {
    return _.map(this.props.organizations, function(org){
      return {
        label: org.name,
        value: org.id
      };
    })
  },

  organizationSelected: function(ev) {
    console.log("org selected")
    console.log(ev)
  },

  render: function() {
    var select_options = this.getSelectOptions();
    return ( 
            <SelectInput ref="organization" className="u-full-width input" name="organization" options={select_options} onChange={this.organizationSelected} />
           )
  }
});

module.exports = OrganizationsSelect;

