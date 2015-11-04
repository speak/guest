var React = require('react');
var classNames = require('classnames');
//var MuteButton = require('./mute-button');
var Avatar = require('speak-widgets').Avatar;
var UserActions = require('../actions/user-actions');
//var OpenTok = require('../libs/opentok');
var $ = require('jquery-browserify');

var UserVideo = React.createClass({
  
  handleClick: function(ev) {
    ev.preventDefault();
    
    var user_id = (this.props.channel.highlighted_user_id == this.props.item.id && this.props.channel.highlighted_type == 'video') ? null : this.props.item.id;
    UserActions.channelToggleHighlight(user_id, 'video');
  },
  
  getInitialState: function() {
    return {
      playing: false
    }
  },

  getInitials: function(){
    var user = this.props.item;
    var i = "";
    
    if (user.first_name && user.last_name) {
      i = user.first_name[0] + user.last_name[0];
    } else if (user.first_name) {
      i = user.first_name[0];
    } else if (user.email) {
      i = user.email[0];
    }
    
    return i.toUpperCase();
  },
  
  render: function() {
    var user = this.props.item;
    var audioOnly = !this.props.video || !this.state.playing;
    var mute;

   // if(user.muted) {
   //   mute = <MuteButton muted={user.muted} speaking={user.speaking} />
   // }
    
    var classes = classNames({
      'user': true,
      'me': user.me,
      'video': !audioOnly,
      'audio-only': audioOnly,
      'speaking': user.speaking,
      'mini': !this.props.centered,
      'centered': this.props.centered,
      'selected': this.props.channel.highlighted_user_id == this.props.item.id && this.props.channel.highlighted_type == 'video'
    });
    
    return <li className={classes} onClick={this.handleClick}>
      <Avatar user={user} circle={audioOnly && this.props.centered} simple={true} initials={false} />
      <div className="video" ref="video"></div>
      <div className="overlay"></div>
      <span className="name">{user.me ? "Me" : user.first_name.capitalize()}</span>
      <span className="initial">{user.me ? "Me" : this.getInitials()}</span>
      {mute}
    </li>;
  },
  
  
  /*
  updateVideoElement: function() {
    var video = this.refs.video.getDOMNode();
    var user = this.props.item;
    var element = OpenTok.getDOMElement(user.id, 'camera');
    
    if (user.publishing_video && element) {
      video.innerHTML = "";
      video.appendChild(element);

      var $video = $(video);
      $video.off('DOMSubtreeModified');
      $video.on('DOMSubtreeModified', this.bindPlayingEvent);

    } else {
      this.state.playing = false;
    } 
  },

  bindPlayingEvent: function() {
    if (this.refs.video) {
      var container = this.refs.video.getDOMNode();
      var $video = $(container).find('video');

      if($video.length) {
        $video.off('playing');
        $video.one('playing', function(){
          if (this.isMounted()) {
            this.setState({playing: true});
          }
        }.bind(this));
      }
    }
  },

  componentDidMount: function() {
    this.updateVideoElement();
  },

  componentDidUpdate: function(prevProps) {
    if (prevProps.video != this.props.video){
      this.updateVideoElement();		
    }
    
    var user = this.props.item;
    var element = OpenTok.getDOMElement(user.id, 'camera');
    if (element) $(element).trigger('resize');
  }
  */
});

module.exports = UserVideo;
