var React = require('react');
var MediaManager = require('../libs/media-manager');

var VolumeVisualizer = React.createClass({
  
  getInitialState: function(){
    return {
      volume: 0
    }
  },
  
  render: function(){
    var styles = {
      width: this.state.volume + "%"
    };
    
    return <div className="volume-meter" style={styles}></div>
  },
  
  startProcessingAudio: function() {
    this.stopProcessingAudio();
    var context = MediaManager.getAudioContext();

    // Create an AudioNode from the stream.
    this.mediaStreamSource = context.createMediaStreamSource(this.props.stream);

    // setup a analyzer
    this.analyser = context.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.3;
    this.analyser.fftSize = 1024;

    // connect the source to the analyser
    this.mediaStreamSource.connect(this.analyser);
    
    this.intervalUpdate = setInterval(this.updateVolume, 50);
  },
  
  stopProcessingAudio: function() {
    clearInterval(this.intervalUpdate);

    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
    }
  },
  
  componentDidMount: function() {
    this.startProcessingAudio();
  },
  
  componentWillUnmount: function() {
    this.stopProcessingAudio();
  },
  
  componentDidUpdate: function(prevProps, prevState) {
    if (prevProps.stream != this.props.stream) {
      this.startProcessingAudio();
    }
  },
  
  updateVolume: function() {
    var array =  new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(array);
    this.setState({ volume: Math.floor(this.getAverageVolume(array)) });
  },
  
  getAverageVolume: function(array) {
    var values = 0;
    var average;

    var length = array.length;

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
      values += array[i];
    }

    average = values / length;
    return average;
  }
});

module.exports = VolumeVisualizer;
