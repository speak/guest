var React = require('react');
var UserActions = require('../actions/user-actions');
var emojione = require('emojione');
var $ = require('jquery'); 
var g = require('jquery.autogrow-textarea'); 

var ChannelName = React.createClass({

  getInitialState: function() {
    return {
      escaped: false,
      name: this.props.name
    }
  },

  saveChanges: function() {
    if (this.state.escaped) {
      this.state.escaped = false;
      return;
    }

    if (this.state.name != this.props.name) {
      UserActions.channelUpdate({
        id: this.props.id,
        name: this.state.name
      });
    }
    this.refs.input.blur();
  },
  
  handleChange: function() {
    this.setState({name: this.refs.input.value});
  },

  handleKeyDown: function(ev) {
    if (ev.keyCode === 13) { // ENTER
      this.saveChanges();
    }
    
    if (ev.keyCode === 27) { // ESC
      this.cancelEdit();
    }
  },
  
  cancelEdit: function() {
    this.setState({escaped: true, name: this.props.name});
    var element = this.refs.input;
    element.value = this.props.name;
    element.blur();
  },

  render: function(){
    // Note: Hidden input field prevents immediate focus on the field
    // when the app is loaded, whilst still allowing tab navigation
    return <div id="channel-name">
      <input type="text" style={{position: 'fixed', left: '-1000px'}} />
      <input autoFocus={false} 
             title={this.state.name} 
             value={this.state.name} 
             type="text" 
             placeholder="Name call" 
             ref="input" 
             onKeyDown={this.handleKeyDown} 
             onBlur={this.saveChanges} 
             onChange={this.handleChange} 
             disabled={this.props.disabled} />
    </div>
  },
  
  componentDidMount: function() {
    $(this.refs.input).autogrow({vertical: false, horizontal: true});
  },
  
  componentWillUnmount: function() {
    // clean up our shadow dom element
    $('.autogrow-shadow').first().remove();
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.name != this.props.name) {
      this.setState({name: nextProps.name});
    }
  }
});

module.exports = ChannelName;
