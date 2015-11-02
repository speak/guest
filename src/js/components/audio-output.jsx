var React = require('react');
var attachMediaStream = require('attachmediastream');
var WebRTC = require('../libs/webrtc'); 

var AudioOutput = React.createClass({ 
  componentDidMount: function() {
    this.updateMediaStream();
  },

  componentDidUpdate: function(prevProps) {
    if (prevProps.streamId != this.props.streamId) {
      this.updateMediaStream();
    }
  },
  
  updateMediaStream: function() {
    var element = this.refs.audio.getDOMNode();

    if (this.props.streamId) {
      attachMediaStream(WebRTC.getRemoteStream(), element);
    } else {
      element.removeAttribute('src');
    }
  },
  
  render: function(){
    return <audio id="audio-output" ref="audio" />;
  }
});

module.exports = AudioOutput;