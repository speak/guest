var React = require('react');
var Flux = require('delorean').Flux;
var Message = require('./message');
var Event = require('./event');
var Composer = require('./composer');
var _ = require('underscore');
var $ = require('jquery');

var Chat = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['chatStore'],
  
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

  render: function(){
    var list = [];
    var messages = this.getStore('chatStore');
    var previous_author_id;
    var last = this.state.last;
    var index = 0;
    
    _.each(messages, function(message){
      var style;
      
      if (index < last) style = {opacity: 0};
      if (index == last) style = {opacity: 0.5};
      
      if (message.event) {
        list.push(<Event key={message.id} message={message} style={style} />);        
      } else {
        list.push(<Message key={message.id} message={message} style={style} author_hidden={previous_author_id == message.author_id} />);
        previous_author_id = message.author_id;
      }
      index++;
    });
    
    return <div id="chat" ref="chat">
      <ul>{list}</ul>
      <Composer typing={this.props.typing} />
    </div>;
  }
});

module.exports = Chat;