var React = require('react');
var classNames = require('classnames');
var UserActions = require('../actions/user-actions');
var UsersStore = require('../stores/users-store');
var AppStore = require('../stores/app-store');
var Composer = require('./composer');
var emojione = require('emojione');
var twitter = require('twitter-text');

var Message = React.createClass({

  getDefaultProps: function() {
    return {
      author_hidden: false
    }
  },

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
  
  getUser: function() {
    var author_id = this.props.message.user_id;
    
    if (author_id && author_id != AppStore.get('user_id')) {
      return UsersStore.get(author_id);
    }
    
    return {
      first_name: "Me"
    }
  },
  
  cancelEditing: function() {
    UserActions.cancelEditing(this.props.message.id);
  },
  
  getContent: function() {
    if (this.props.message.editing) {
      return <div className="bubble">
        <Composer text={this.props.message.text} id={this.props.message.id} />
        <span className="note">esc to <a onClick={this.cancelEditing}>cancel</a></span>
      </div>;
    } else {
      var user = this.getUser();
      var author;
      
      if (user && !this.props.author_hidden && !this.props.message.type) {
        author = <span className="author">{user.first_name} {user.last_name}</span>;
      }
      
      return <div className="bubble">
        {author}
        {this.getTextAsHTML()}
      </div>;
    }
  },
  
  render: function(){
    var classes = classNames({
      'message': true,
      'editing': this.props.message.editing,
      'persisted': this.props.message.persisted
    });
    
    return <li className={classes} style={this.props.style}>{this.getContent()}</li>;
  }
});

module.exports = Message;
