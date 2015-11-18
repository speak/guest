var React = require('react');
var Avatar = require('speak-widgets').Avatar;
var _ = require('underscore');

var Participants = React.createClass({
  render: function(){
    var list = [];
    var heading;
    
    _.each(this.props.users, function(user){
      list.push(<li key={user.id} className="animated fadeIn"><Avatar user={user} simple={true} /><span className="name">{user.first_name}</span></li>);
    });
    
    if (list.length) {
      heading = <h2>Already Here</h2>;
    }
    
    return <div id="participants">
      {heading}
      <ul>{list}</ul>
    </div>;
  }
});

module.exports = Participants;