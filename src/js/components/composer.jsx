var React = require('react');
var UserActions = require('../actions/user-actions');
var ChannelStore = require('../stores/channel-store');

var Composer = React.createClass({
  sendMessage: function(ev){
    ev.preventDefault();
    var val = this.refs.input.value;
    this.refs.input.value = "";
    UserActions.sendMessage(val, ChannelStore.get('id'));
  },

  render: function(){
    return(
      <div id="composer">
      <textarea ref="input">
      </textarea>
      <a onClick={this.sendMessage}>Submit</a>
      </div>
    )
  }
});

module.exports = Composer;



