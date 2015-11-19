var React = require('react');

var Fullname = React.createClass({
  
  getDefaultProps: function() {
    return {
      use_me: true,
    }
  },

  render: function() {
    var user = this.props.user;
    var display = "";
    
    if (user.first_name) display += user.first_name.capitalize();
    if (user.last_name) display += " " + user.last_name.capitalize();
    if (user.me && this.props.use_me) display = "Me";
    
    return <span className="full-name">{display}</span>;
  }
});

module.exports = Fullname;