var React = require('react');
var Flux = require('delorean').Flux;
var AppActions = require('../../actions/app-actions');
var SelectInput = require('../select-input');
var MediaManager = require('../../libs/media-manager');
var _ = require('underscore');

var AudioOutputSelect = React.createClass({ 
  getInitialState: function() {
    return {
      options: []
    }
  },

  componentDidMount: function() {
    var self = this;
    MediaManager.getAudioOutputDevices(function(audioSources){
      if (!self.isMounted()) return;
      
      if(audioSources.length) {
        var options = _.map(audioSources, function(source) {
          source.value = source.deviceId;
          return source;
        });
        self.setState({options: options});
      } else {
        self.setState({
          options: [{label: 'No speakers detected', value: ''}] 
        });
      }
    });
  },
  
  submitForm: function() {
    AppActions.preferences({
      audio_sink: this.refs.output.value
    });
  },

  render: function(){
    return <SelectInput ref="output" value={this.props.deviceId} onChange={this.submitForm} className="u-full-width input" name="audio-output" options={this.state.options} />;
  }
});

module.exports = AudioOutputSelect;