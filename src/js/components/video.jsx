var React = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var classNames = require('classnames');
var CallControls = require('./call-controls');
var ChannelStore = require('../stores/channel-store');
var UserActions = require('../actions/user-actions');
var UserVideo = require('./user-video');
var UserScreen = require('./user-screen');
var ChannelName = require('./channel-name');
var _ = require('underscore');

var Video = React.createClass({
  
  getDefaultProps: function() {
    return {
      stopHoveringAfter: 3000
    }
  },

  getInitialState: function() {
    return {
      hovering: true,
      timeout_hide: null,
    }
  },
  
  handleKeyDown: function() {
    UserActions.typing(true);
  },
  
  closeMenu: function(ev) {
    if (this.props.app.menu) {
      // if the menu is open we want first click to close it
      ev.stopPropagation();
      UserActions.closeMenu();
    }
  },

  handleMouseMove: function() {
    clearTimeout(this.state.timeout_hide);
    
    if (!this.state.hovering) {
      this.setState({hovering: true});
    }
    
    this.state.timeout_hide = setTimeout(function(){
      if (this.isMounted() && this.state.hovering) {
        this.setState({hovering: false});
      }
    }.bind(this), this.props.stopHoveringAfter);
  },

  render: function(){
    var list = [];
    var channel = this.props.channel;
    var me = this.props.user;
    var users, centered;
    var title;

    if(channel) {
      var active_speaker = ChannelStore.getActiveSpeaker() || {};
      var users = _.sortBy(this.props.users, function(user){
        return user.me ? 0 : 1;
      });
    
      _.each(users, function(user, index) {
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
      'hovering': this.state.hovering,
      'screen-centered': active_speaker && active_speaker.type == 'screen'
    });

    return <div id="video" className={classes} onClick={this.closeMenu} onMouseMove={this.handleMouseMove} onKeyDown={this.handleKeyDown}>
      <ReactCSSTransitionGroup component="ul" transitionName="mini" transitionEnterTimeout={250} transitionLeaveTimeout={250} className="users">{list}</ReactCSSTransitionGroup>
      <CallControls user={me} channel={channel} />
      <ChannelName {...channel} />
    </div>;
  }
});

module.exports = Video;