var React = require('react');
var Flux = require('delorean').Flux;
var AppActions = require('../../actions/app-actions');
var VideoInputSelect = require('./video-input-select');
var AudioInputSelect = require('./audio-input-select');
var AudioOutputSelect = require('./audio-output-select');
var $ = require('jquery');

var Media = React.createClass({
  mixins: [Flux.mixins.storeListener],
  
  watchStores: ['preferencesStore'],
  
  render: function(){
    var prefs = this.getStore('preferencesStore');
    
    return (
      <div id="media-preferences">
        <form onSubmit={this.submitForm}>
          <div className="row">
            <div className="column">
              <label>Microphone</label>
            </div>
            <div className="column">
              <AudioInputSelect deviceId={prefs.audio_input} />
            </div>
          </div>
      
          <div className="row video">
            <div className="column">
              <label>Camera</label>
            </div>
            <div className="column">
              <VideoInputSelect deviceId={prefs.video_input} />
            </div>
          </div> 
        </form>
      </div>
    );
  }
});

module.exports = Media;