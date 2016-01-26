var React = require('react');
var classNames = require('classnames');

var RecordButton = React.createClass({ 

  getDefaultProps: function() {
    return {
      hasTooltip: true,
      enabled: false,
      onClick: function(){}
    }
  },
  
  getInitialState: function() {
    return {
      transition: false
    }
  },
  
  onClick: function() {
    this.setState({transition: true});
    this.props.onClick();
  },
  
  componentDidUpdate: function(prevProps) {
    if (this.props.enabled != prevProps.enabled) {
      this.setState({transition: false});
    }
  },
  
  getTooltipText: function() {
    if (this.state.transition) return "Just a second...";
    return this.props.enabled ? "Stop Recording" : "Start Recording";
  },
  
  render: function(){
    var tooltip;
    var classes = classNames({
      'record': true,
      'animated': true,
      'transition': this.state.transition,
      'disabled': this.props.disabled,
      'enabled': this.props.enabled
    });
    
    if (this.props.hasTooltip) {
      tooltip = <span className="tooltip">{this.getTooltipText()}<i className="triangle"></i></span>;
    }

    return <span>
      <a className={classes} {...this.props} onClick={this.onClick}></a>
      {tooltip}
    </span>;
  }
});

module.exports = RecordButton;