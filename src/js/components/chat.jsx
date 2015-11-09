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

    _.each(this.getStore('chatStore'), function(message){
      list.push(<Message key={message.id} message={message} />);
    });
    
    return <div id="chat">
      <ul>{list}</ul>
      <Composer typing={this.props.typing} />
    </div>;
  }
});

module.exports = Chat;