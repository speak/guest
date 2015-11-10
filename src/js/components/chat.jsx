var React = require('react');
var Flux = require('delorean').Flux;
var Message = require('./message');
var Composer = require('./composer');
var _ = require('underscore');

var Chat = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['chatStore'],
  
  render: function(){
    var list = [];
    var messages = this.getStore('chatStore');
    var previous_author_id;
    
    _.each(messages, function(message){
      list.push(<Message key={message.id} message={message} author_hidden={previous_author_id == message.author_id} />);
      previous_author_id = message.author_id;
    });
    
    return <div id="chat">
      <ul>{list}</ul>
      <Composer typing={this.props.typing} />
    </div>;
  }
});

module.exports = Chat;