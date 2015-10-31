var React = require('react');
var Flux = require('delorean').Flux;

var ChannelInfo = React.createClass({
  logout: function(ev){
    ev.preventDefault();
    AuthActions.signout();
  },
  
  render: function() {
    return <div>
    Join { this.props.name || this.props.path }
    </div>;
  }
});

module.exports = ChannelInfo;

