var React = require('react');
var Flux = require('delorean').Flux;
var AppActions = require('../../actions/app-actions');
var SelectInput = require('../select-input');
var MediaManager = require('../../libs/media-manager');
var VideoOutput = require('../../components/video-output');
var getUserMedia = require('getusermedia');
var _ = require('underscore');

var VideoInputSelect = React.createClass({ 

  getInitialState: function() {
    return {
      disabled: false,
      requesting: false,
      stream: null,
      options: []
    }
  },

  componentDidUpdate: function(prevProps) {
    if(!this.state.requesting && (!this.state.stream || (prevProps.deviceId != this.props.deviceId))){
      this.setState({requesting:true});
      var self = this;

      MediaManager.getVideoConstraints(function(constraints){
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
    MediaManager.getVideoSources(function(videoSources){
      if (!self.isMounted()) return;
      
      if(videoSources.length) {
        var options = _.map(videoSources, function(source) {
          return {
            label: source.label,
            value: source.deviceId
          };
        });
        self.setState({options: options})
      } else {
        self.setState({
          disabled: true,
          options: [{label: 'No cameras detected', value: ''}] 
        });
      }
    });
  },

  componentWillUnmount: function() {
    this.stopStream();
  },
  
  stopStream: function() {
    if (this.state.stream) {
      this.state.stream.stop();
    }
  },

  submitForm: function() {
    AppActions.preferences({
      video_input: this.refs.input.value
    });
  },

  render: function(){
    return <div className="video-wrapper">
      <SelectInput ref="input" options={this.state.options} value={this.props.deviceId} onChange={this.submitForm} onBlur={this.submitForm} className="u-full-width input" disabled={this.state.disabled} /> 
      <VideoOutput deviceId={this.props.deviceId} stream={this.state.stream} disabled={this.state.disabled} />
    </div>;
  }
});

module.exports = VideoInputSelect;


