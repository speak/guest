var React = require('react');
var UserActions = require('../actions/user-actions');
var ChannelStore = require('../stores/channel-store');
var emojione = require('emojione');
var $ = require('jquery'); 
var g = require('jquery.autogrow-textarea'); 

var Composer = React.createClass({
  
  getDefaultProps: function() {
    return {
      text: "",
      id: null
    }
  },
  
  getPlaceholder: function() {
    if (this.props.id) {
      return "Editing message...";
    }
    
    return "Type a message...";
  },

  sendMessage: function(ev){
    ev.preventDefault();
    
    emojione.ascii = true;
    var val = emojione.toShort(this.refs.input.value);
    this.refs.input.value = "";
    
    if (val) {
      if (this.props.id) {
        UserActions.updateMessage({
          channel_id: ChannelStore.get('id'),
          id: this.props.id,
          text: val
        });
      } else {
        UserActions.sendMessage(val, ChannelStore.get('id'));
      }
    }
  },

  handleKeyDown: function(ev) {
    if (ev.keyCode === 13 && !ev.shiftKey) { // ENTER
      this.sendMessage(ev);
    }
    
    if (this.props.id && ev.keyCode === 27) { // ESC
      UserActions.cancelEditing(this.props.id);
    }
    
    if (ev.keyCode === 38) { // UP
      if (!this.props.id && !this.refs.input.value) {
        ev.preventDefault();
        UserActions.editLastMessage();
      }
    }
  },
  
  handleBlur: function() {
    UserActions.typing(false);
  },

  componentDidMount: function() {
    $(this.refs.input).autogrow({vertical: true, horizontal: false});
    
    if (this.props.id) {
      $(this.refs.input).focus();
      
      // puts cursor at the end of the input
      this.refs.input.selectionStart = this.refs.input.selectionEnd = this.refs.input.value.length;
    }
  },
  
  componentWillUnmount: function() {
    // clean up our shadow dom element
    $('.autogrow-shadow').last().remove();
  },
  
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.typing && !this.props.typing) {
      $(this.refs.input).focus();
    }
  },
  
  render: function(){
    var save;
    
    if (this.props.id) {
      save = <span className="note save">↵ to <a onClick={this.sendMessage}>save</a></span>;
    }

    return <div>
      <textarea placeholder={this.getPlaceholder()} defaultValue={this.props.text} className="composer" ref="input" onKeyDown={this.handleKeyDown} onBlur={this.handleBlur}></textarea>
      {save}
    </div>;
  }
});

module.exports = Composer;