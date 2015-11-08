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

  handleKeyDown: function(ev) {
    console.log(ev.metaKey);
    if (ev.keyCode === 13) { // ENTER
      this.sendMessage(ev);
    }
  },

  render: function(){
    return <div id="composer">
      <textarea className="composer" ref="input" onKeyDown={this.handleKeyDown}></textarea>
    </div>;
  }
});

module.exports = Composer;