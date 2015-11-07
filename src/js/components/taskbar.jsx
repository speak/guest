var React = require('react');
var classNames = require('classnames');
var Signout = require('./signout');
var ChannelName = require('./channel-name');

var Taskbar = React.createClass({
  render: function () {
    var action;

    if (this.props.authenticated) {
      action = <Signout />;
    }
  
    return <div id="taskbar">
      {action}
    </div>;
  }
});

module.exports = Taskbar;