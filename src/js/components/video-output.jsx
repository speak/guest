var React = require('react');
var classNames = require('classnames');
var attachMediaStream = require('attachmediastream');
var $ = require('jquery');

var VideoOutput = React.createClass({
  
  getDefaultProps: function() {
    return {
      disabled: false
    }
  },

  componentDidMount: function() {
    this.attachMediaStream();
  },
  
  componentDidUpdate: function(prevProps) {
    if (prevProps.deviceId != this.props.deviceId || prevProps.stream != this.props.stream) {
      this.attachMediaStream();
    }
  },
  
  attachMediaStream: function() {
    if (this.props.stream) {
      var $video = $(this.refs.video);
      $video.off('playing').hide();
      attachMediaStream(this.props.stream, this.refs.video);
      $video.on('playing', function(){
        $video.fadeIn();
      });
    }
  },
  
  render: function(){
    var classes = classNames({
      'video-placeholder': true,
      'disabled': this.props.disabled
    });

    return <div className={classes}>
      <video ref="video" autoPlay="true" />
    </div>;
  }
});

module.exports = VideoOutput;