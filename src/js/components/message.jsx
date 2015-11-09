var React = require('react');
var classNames = require('classnames');
var UserActions = require('../actions/user-actions');
var Composer = require('./composer');
var emojione = require('emojione');
var twitter = require('twitter-text');

var Message = React.createClass({

  getTextAsHTML: function() {
    var escaped = twitter.htmlEscape(this.props.message.text);
    var entities = twitter.extractEntitiesWithIndices(escaped, {extractUrlsWithoutProtocol: true});
    var html = twitter.autoLinkEntities(escaped, entities, {targetBlank: true});

    // convert shorttags to emoji img tags
    emojione.ascii = true;
    html = emojione.shortnameToImage(html);

    // creating proper newlines in html
    return html.split("\n").map(function(item, index) {
      return <span key={index} dangerouslySetInnerHTML={{__html: item + "<br/>"}} />;
    });
  },
  
  cancelEditing: function() {
    UserActions.cancelEditing(this.props.message.id);
  },
  
  getContent: function() {
    if (this.props.message.editing) {
      return <div className="text">
        <Composer text={this.props.message.text} id={this.props.message.id} />
        <span className="note">esc to <a onClick={this.cancelEditing}>cancel</a></span>
      </div>;
    } else {
      return <div className="text">{this.getTextAsHTML()}</div>;
    }
  },
  
  render: function(){
    var classes = classNames({
      'message': true,
      'editing': this.props.message.editing,
      'persisted': this.props.message.persisted
    });
    
    return <li className={classes}>{this.getContent()}</li>;
  }
});

module.exports = Message;
