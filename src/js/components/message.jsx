var React = require('react');
var classNames = require('classnames');

var Message = React.createClass({
  render: function(){
    var classes = classNames({
      'message': true,
      'persisted': this.props.message.persisted
    });
    
    return <li className={classes}>
      <div className="text">{this.props.message.text}</div>
    </li>;
  }
});

module.exports = Message;