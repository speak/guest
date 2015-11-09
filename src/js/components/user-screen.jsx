var React = require('react');
var classNames = require('classnames');
var UserActions = require('../actions/user-actions');
var OpenTok = require('../libs/opentok');
var $ = require('jquery');

var UserScreen = React.createClass({
  
  handleClick: function(ev) {
    ev.preventDefault();

    // if the screen is ours and we're fullscreen, ignore.
    //if (this.props.item.me && AppStore.get('fullscreen')) return;
    
    var user_id = (this.props.item.highlighted && this.props.item.highlighted_type == 'screen') ? null : this.props.item.id;
    UserActions.userHighlight(user_id, 'screen');
  },
  
  getInitials: function(){
    var user = this.props.item;
    var i = "";
    
    if (user.first_name && user.last_name) {
      i = user.first_name[0] + user.last_name[0];
    } else if (user.first_name) {
      i = user.first_name[0];
    } else if (user.email) {
      i = user.email[0];
    }
    
    return i.toUpperCase();
  },
  
  render: function() {
    var user = this.props.item;

    var classes = classNames({
      'user': true,
      'screen': true,
      'me': user.me,
      'mini': !this.props.centered,
      'centered': this.props.centered,
      'selected': user.highlighted && user.highlighted_type == 'screen'
    });
    
    return <li className={classes} onClick={this.handleClick}>
      <div className="screen" ref="screen"></div>
      <div className="overlay"></div>
      <span className="name">{user.me ? "My" : user.first_name.capitalize() + "'s"}<br/>Screen</span>
      <span className="initial">{user.me ? "Me" : this.getInitials()}</span>
    </li>;
  },

  updateScreenElement: function() {
    var screen = this.refs.screen;
    var user = this.props.item;
    var element = OpenTok.getDOMElement(user.id, 'screen');

    if (user.publishing_screen && element) {
      screen.innerHTML = "";
      screen.appendChild(element);
    }
  },

  componentDidMount: function() {
    this.updateScreenElement();
  },

  componentDidUpdate: function(prevProps) {
    if (prevProps.screen != this.props.screen) {
      this.updateScreenElement();		
    }
    
    var user = this.props.item;
    var element = OpenTok.getDOMElement(user.id, 'screen');
    if (element) $(element).trigger('resize');
  }
});

module.exports = UserScreen;
