var React = require('react');
var classNames = require('classnames');
var UserActions = require('../../actions/user-actions');

var NavigationItem = React.createClass({ 
  
  getDefaultProps: function() {
    return {
      icon: 'cog',
      selected: false,
      disabled: false
    }
  },
  
  handleClick: function() {
    if (!this.props.selected && !this.props.disabled) {
      UserActions.showModal(this.props.value);
    }
  },
  
  render: function(){
    var name = this.props.name || this.props.value;
    
    var classes = classNames({
      'selected': this.props.selected,
      'disabled': this.props.disabled
    });
    
    return <li className={classes}>
      <a onClick={this.handleClick}>
        <i className={this.props.icon}></i> 
        <span>{name.capitalize()}</span>
      </a>
    </li>;
  },
});

module.exports = NavigationItem;