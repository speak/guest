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
  
  render: function(){
    var tooltip;
    var text = this.props.enabled ? "Stop Recording" : "Start Recording";

    if (this.props.hasTooltip) {
      tooltip = <span className="tooltip">{text}<i className="triangle"></i></span>;
    }

    return <span>
      <a className="record" {...this.props}></a>
      {tooltip}
    </span>;
  }
});

module.exports = RecordButton;