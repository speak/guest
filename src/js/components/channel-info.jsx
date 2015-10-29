var React = require('react');
var Flux = require('delorean').Flux;

var ChannelInfo = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['channelStore'],

  logout: function(ev){
    ev.preventDefault();
    AuthActions.signout();
  },
  
  render: function() {
    return <div>
    Join {this.props.name}
    </div>;
  }
});

module.exports = ChannelInfo;

