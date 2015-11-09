var React = require('react');
var MuteButton = require('speak-widgets').MuteButton;
var VideoButton = require('speak-widgets').VideoButton;
var ScreenButton = require('speak-widgets').ScreenButton;
var AddPeopleButton = require('speak-widgets').AddPeopleButton;
var LeaveButton = require('speak-widgets').LeaveButton;
var $ = require('jquery');

var CallControls = React.createClass({
  
  getInitialState: function() {
    return {
      tooltip: false,
      tooltip_timeout: null,
      tooltip_hide_after: 750,
      screenshare_supported: true,
      screenshare_extension_installing: false,
      screenshare_extension_installed: false
    }
  },
  
  componentDidMount: function() {
    OT.checkScreenSharingCapability(function(response) {
      if (!this.isMounted()) return;
      
      if (!response.supported || response.extensionRegistered === false) {
        this.setState({screenshare_supported: false});
      } else if (response.extensionInstalled === false) {
        this.setState({screenshare_extension_installed: false});
      } else {
        this.setState({screenshare_extension_installed: true});
      }
    }.bind(this));
  },
  
  updateTooltipTimeout: function(ev) {
    var offset = $(ev.currentTarget).offset();
    var height = $(ev.currentTarget).height();

    if (ev.clientY > offset.top+height) {
      this.hideTooltip();
      this.stopTooltipTimeout();
    } else if(!this.tooltipTimeout) {
      this.startTooltipTimeout();
    }
  },
  
  startTooltipTimeout: function() {
    clearTimeout(this.state.tooltip_timeout);
    this.state.tooltip_timeout = setTimeout(this.showTooltip, this.state.tooltip_hide_after);
  },
  
  stopTooltipTimeout: function() {
    clearTimeout(this.state.tooltip_timeout);
    delete this.state.tooltip_timeout;
  },
  
  showTooltip: function() {
    if (this.isMounted()) {
      this.setState({tooltip: true});
    }
  },
  
  hideTooltip: function() {
    if (this.isMounted()) {
      this.setState({tooltip: false});
    }
  },
  
  toggleMute: function() {
    if (this.props.user.muted) {
      UserActions.unmute();
    } else {
      UserActions.mute();
    }
  },
  
  toggleVideo: function() {
    if (this.props.user.publishing_video) {
      UserActions.unpublishVideo();
    } else {
      UserActions.publishVideo();
    }
  },
  
  toggleScreen: function() {
    if (!this.state.screenshare_extension_installed) {
      this.setState({screenshare_extension_installing: true});
      
      UserActions.installScreenshareExtension(function(err){
        this.setState({screenshare_extension_installing: false});

        if (!err) {
          this.setState({screenshare_extension_installed: true});
        }
      }.bind(this));
    } else if (this.props.user.publishing_screen) {
      UserActions.unpublishScreen();
    } else {
      UserActions.publishScreen();
    }
  },
  
  toggleAddPerson: function() {
    
  },
  
  leave: function() {
    window.close();
  },

  render: function(){
    return <nav id="call-controls">
      <ul onMouseLeave={this.hideTooltip} className="controls">
        <MuteButton onClick={this.toggleMute} enabled={this.props.user.muted} speaking={this.props.user.speaking} onMouseMove={this.updateTooltipTimeout} onMouseLeave={this.stopTooltipTimeout} />
        <VideoButton onClick={this.toggleVideo} enabled={this.props.user.publishing_video} onMouseMove={this.updateTooltipTimeout} onMouseLeave={this.stopTooltipTimeout} />
        <ScreenButton onClick={this.toggleScreen} disabled={!this.state.screenshare_supported} enabled={this.props.user.publishing_screen} working={this.state.screenshare_extension_installing} onMouseMove={this.updateTooltipTimeout} onMouseLeave={this.stopTooltipTimeout} />
        <AddPeopleButton onMouseMove={this.updateTooltipTimeout} onMouseLeave={this.stopTooltipTimeout} />
        <LeaveButton onClick={this.leave} onMouseMove={this.updateTooltipTimeout} onMouseLeave={this.stopTooltipTimeout} />
      </ul>
    </nav>;
  }
});

module.exports = CallControls;