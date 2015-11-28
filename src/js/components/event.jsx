var React = require('react');
var UsersStore = require('../stores/users-store');

var Event = React.createClass({

  getUser: function() {
    var author_id = this.props.message.user_id;
    return UsersStore.get(author_id);
  },
  
  getText: function() {
    switch(this.props.message.event) {
      case "channel.joined":
        return "joined";
      case "channel.left":
        return "left";
    }
  },
  
  render: function(){
    var user = this.getUser();
    if (!user) return null;
    
    return <li className="message event" style={this.props.style}>
      <div className="bubble">
        <span className="author inline">{user.first_name}</span> {this.getText()}
      </div>
    </li>;
  }
});

module.exports = Event;
