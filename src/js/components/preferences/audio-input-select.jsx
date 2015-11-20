var React = require('react');
var Flux = require('delorean').Flux;
var AppActions = require('../../actions/app-actions');
var SelectInput = require('../select-input');
var MediaManager = require('../../libs/media-manager');
var VolumeVisualizer = require('../volume-visualizer');
var getUserMedia = require('getusermedia');
var _ = require('underscore');

var AudioInputSelect = React.createClass({ 

  getInitialState: function() {
    return {
      requesting: false,
      stream: null,
      options: []
    }
  },

  componentDidUpdate: function(prevProps) {
    if(!this.state.requesting && (!this.state.stream || (prevProps.deviceId != this.props.deviceId))){
      this.setState({requesting:true});
      var self = this;
      
      MediaManager.getAudioConstraints(function(constraints){
        getUserMedia(constraints, function(err, stream) {
          if (err) {
            if (self.isMounted()) {
              self.setState({requesting: false});
            }
            throw error;
          }
          
          self.stopStream();
          if (self.isMounted()) {
            self.setState({stream: stream, requesting: false});
          }
        });
      });
    }
  },

  componentDidMount: function() {
    var self = this;
    MediaManager.getAudioSources(function(audioSources){
      if (!self.isMounted()) return;
      
      console.log(audioSources);
      
      if(audioSources.length) {
        var options = _.map(audioSources, function(source) {
          source.value = source.deviceId;
          return source;
        });
        self.setState({options: options});
      } else {
        self.setState({
          options: [{label: 'No inputs detected', value: ''}] 
        });
      }
    });
  },

  componentWillUnmount: function() {
    this.stopStream();
  },
  
  stopStream: function() {
    if (this.state.stream) {
      var tracks = this.state.stream.getAudioTracks();
      if (tracks && tracks[0] && tracks[0].stop) {
        tracks[0].stop();
      }
    }
  },

  submitForm: function() {
    AppActions.preferences({
      audio_input: this.refs.input.value
    });
  },

  render: function(){
    var visualizer;
    
    if (this.state.stream) {
      visualizer = <VolumeVisualizer key={this.props.deviceId+''} stream={this.state.stream} />;
    }

    return <div>
      <SelectInput ref="input" value={this.props.deviceId} onChange={this.submitForm} className="u-full-width input with-meter" name="audio-input" options={this.state.options} />
      <div className="volume-wrapper">{visualizer}</div>
    </div>;
  }
});

module.exports = AudioInputSelect;


