var React = require('react');
var classNames = require('classnames');
var CallControls = require('./call-controls');
var ChannelStore = require('../stores/channel-store');
var UserVideo = require('./user-video');
var UserScreen = require('./user-screen');
var _ = require('underscore');

var Video = React.createClass({
  
  handleMouseMove: function() {
    
  },

  render: function(){
    var list = [];
    var channel = this.props.channel;
    var me = this.props.user;
    var users, centered;
    var title;

    if(channel) {
      var active_speaker = ChannelStore.getActiveSpeaker() || {};

      _.each(this.props.users, function(user, index) {
        if (!user.me && user.channel_state) return;

        // first because float right
        if (user.publishing_screen) {
          centered = (user.id == active_speaker.id && active_speaker.type == 'screen');
          list.push(<UserScreen key={user.id + '-screen'} centered={centered} item={user} channel={channel} screen={user.publishing_screen} />)
        }

        centered = (user.id == active_speaker.id && active_speaker.type == 'video');
        list.push(<UserVideo key={user.id + '-video'} centered={centered} item={user} channel={channel} video={user.publishing_video} />)
      });
    }

    var classes = classNames({
      'hovering': this.props.hovering,
      'screen-centered': active_speaker && active_speaker.type == 'screen'
    });

    return <div id="video" className={classes} onMouseMove={this.handleMouseMove}>
      <ul className="users">{list}</ul>
      <CallControls user={me} channel={channel} />
    </div>;
  }
});

module.exports = Video;