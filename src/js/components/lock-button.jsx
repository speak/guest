var React = require('react');
var classNames = require('classnames');

var LockButton = React.createClass({ 

  getDefaultProps: function() {
    return {
      hasTooltip: true,
      enabled: false,
      onClick: function(){}
    }
  },
  
  render: function(){
    var tooltip;
    var classes = classNames({
      'lock': true,
      'enabled': this.props.enabled
    });
    
    if (this.props.hasTooltip) {
      tooltip = <span className="tooltip">{this.props.enabled ? "Unlock Call" : "Lock Call"}<i className="triangle"></i></span>;
    }

    return <span>
      <a className={classes} {...this.props}></a>
      {tooltip}
    </span>;
  }
});

module.exports = LockButton;