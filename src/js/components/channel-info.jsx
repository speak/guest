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
    CHANNEL STUFF GOES HERE
    </div>;
  }
});

module.exports = ChannelInfo;

