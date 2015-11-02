var React = require('react');
var Avatar = require('speak-widgets').Avatar;

var User = React.createClass({
  
  render: function() {
    return <li>
      <Avatar user={this.props.item} /> {this.props.item.first_name}
    </li>;
  }
});

module.exports = User;