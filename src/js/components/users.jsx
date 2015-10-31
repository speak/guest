var React = require('react');
var User = require('./user');

var Users = React.createClass({
  
  render: function() {
    var users = []
    this.props.users.forEach(function(user) {
        users.push(<User first_name={user.first_name} />);
    }.bind(this));

    return (<div> 
    <h1>Users</h1>
    <ul>
    {users}
    </ul>
    </div>);
  }
});

module.exports = Users;

