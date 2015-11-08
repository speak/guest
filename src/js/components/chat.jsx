var React = require('react');
var Flux = require('delorean').Flux;
var Message = require('./message')
var Composer = require('./composer')
var _ = require('underscore');

var Chat = React.createClass({

  mixins: [Flux.mixins.storeListener],
  watchStores: ['chatStore'],
  
  render: function(){
    var list = [];
    _.each(this.getStore('chatStore'), function(m){
      console.log("IDENT")
      console.log(m)
      list.push(<Message key={m.id} message={m} />)
    });
    return(
      <div id="chat">
      <ul>
      {list}
      </ul>
      <Composer />
      </div>
    )
  }
});

module.exports = Chat;

