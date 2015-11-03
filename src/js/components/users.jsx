var React = require('react');
var User = require('./user');
var _ = require('underscore');

var Users = React.createClass({
  
  render: function() {
    var list = [];
    
    _.each(this.props.users, function(user) {
      list.push(<User key={user.id} item={user} />);
    });

    return <ul id="users">{list}</ul>;
  }
});

module.exports = Users;