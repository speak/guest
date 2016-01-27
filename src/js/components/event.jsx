var React = require('react');
var UsersStore = require('../stores/users-store');
var AppStore = require('../stores/app-store');

var Event = React.createClass({

  getUser: function() {
    var author_id = this.props.message.user_id;
    return UsersStore.get(author_id);
  },
  
  getText: function() {
    var author_id = this.props.message.user_id;

    switch(this.props.message.event) {
      case "channel.started_recording":
        return "started recording this call";
      case "channel.stopped_recording":
        if (author_id == AppStore.get('user_id')) {
          return "stopped the call recording. It will be available in my recordings shortly.";
        } else {
          return "stopped the call recording";
        }
      case "channel.locked":
        return "locked the channel";
      case "channel.unlocked":
        return "unlocked the channel";
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
