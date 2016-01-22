var React = require('react');
var Flux = require('delorean').Flux;
var Message = require('./message');
var Event = require('./event');
var Composer = require('./composer');
var _ = require('underscore');
var $ = require('jquery');

var Chat = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['messagesStore'],
  
  getInitialState: function() {
    return {
      last: -1
    }
  },
  
  updateLastVisible: function() {
    var last;
    var messages = $(this.refs.chat).find('.message').get().reverse();
    
    $(messages).each(function(index, message){
      if (!last && $(message).offset().top < 80) {
        last = messages.length-index;
      }
    }.bind(this));
    
    if (this.state.last != last) {
      this.setState({last: last});
    }
  },
  
  componentDidUpdate: function() {
    this.updateLastVisible();
  },
  
  componentDidMount: function() {
    window.addEventListener('resize', this.handleResize);
    this.updateLastVisible();
  },
  
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },

  handleResize: _.throttle(function() {
    this.updateLastVisible();
  }, 200),
  
  preventFullscreen: function(ev) {
    ev.stopPropagation();
  },

  render: function(){
    var list = [];
    var messages = this.getStore('messagesStore');
    var previous_author_id;
    var last = this.state.last;
    var index = 0;
    
    messages = _.sortBy(messages, function(m){ return m.created_at; });
    
    _.each(messages, function(message){
      var style, show_author;
      
      if (index < last) style = {opacity: 0};
      if (index == last) {
        style = {opacity: 0.5};
        show_author = true;
      }
      
      if (message.event) {
        list.push(<Event key={message.id} message={message} style={style} />);
        previous_author_id = 'event';
      } else {
        list.push(<Message key={message.id} message={message} style={style} author_hidden={!show_author && (previous_author_id == message.user_id)} />);
        previous_author_id = message.user_id;
      }
      index++;
    });
    
    return <div id="chat" ref="chat" onDoubleClick={this.preventFullscreen}>
      <ul>{list}</ul>
      <Composer typing={this.props.typing} />
    </div>;
  }
});

module.exports = Chat;