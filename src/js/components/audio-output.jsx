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
    if (this.props.streamId) {
      attachMediaStream(WebRTC.getRemoteStream(), this.refs.audio);
    } else {
      this.refs.audio.removeAttribute('src');
    }
  },
  
  render: function(){
    return <audio id="audio-output" ref="audio" />;
  }
});

module.exports = AudioOutput;