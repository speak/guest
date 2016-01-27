var React = require('react');
var AuthStore = require('../stores/auth-store');
var moment = require('moment');
var _ = require('underscore');

var Recording = React.createClass({
  
  getDownloadUrl: function() {
    return this.props.recording.download_url+"?access_token="+AuthStore.get('access_token');
  },
  
  render: function() {
    var channel = this.props.recording.channel;
    var list = [];
    
    _.each(channel.participated, function(user) {
      list.push(user.first_name);
    })
    
    return <li className="recording">
      <h3 className="users">{list.join(', ')}</h3>
      <a href={channel.public_url} className="duration">{channel.name}</a>
      <span className="duration">{this.props.recording.duration}</span>
      <span className="created-at">{moment(this.props.recording.created_at).format('MMMM Do YYYY, h:mm:ss a')}</span>
      <a className="button small" href={this.getDownloadUrl()} download="Speak Recording">Download</a>
    </li>;
  }
});

module.exports = Recording;