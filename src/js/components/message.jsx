var React = require('react');
var classNames = require('classnames');

var Message = React.createClass({
  render: function(){
    var classes = classNames({
      'persisted': this.props.message.persisted
    });
    return(
      <li className={classes}>
      {this.props.message.text}
      </li>
    )
  }
});

module.exports = Message;


