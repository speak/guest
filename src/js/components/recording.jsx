var React = require('react');
var _ = require('underscore');

var Recording = React.createClass({
  render: function() {
    var channel = this.props.recording.channel;
    var list = [];
    
    _.each(channel.participated, function(user) {
      list.push(user.first_name);
    })
    
    return <li className="recording">
      <span className="users">{list.join(', ')}</span>
      <span className="name">{channel.name}</span>
      <span className="duration">{recording.duration}</span>
      <span className="created-at">{recording.created_at}</span>
      <a href={recording.download_url}>Download</a>
    </li>;
  }
});

module.exports = Recording;