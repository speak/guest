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
    var classes = classNames({
      'record': true
    });

    if (this.props.hasTooltip) {
      tooltip = <span className="tooltip">Record Call<i className="triangle"></i></span>;
    }

    return <li {...this.props} className="call-control">
      <a className={classes}></a>
      {tooltip}
    </li>;
  }
});

module.exports = RecordButton;