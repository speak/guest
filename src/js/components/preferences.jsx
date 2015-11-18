var React = require('react');
var Navigation = require('./preferences/navigation');
var Media = require('./preferences/media');
//var Shortcuts = require('./preferences/shortcuts');

var Preferences = React.createClass({
  
  getContent: function() {
    switch(this.props.selected) {
      case 'shortcuts':
        //return <Shortcuts />;
      case 'media':
        return <Media />;
    }
  },
  
  render: function() {
    return <div id="preferences">
      <Navigation selected={this.props.selected} />
      <section>
        {this.getContent()}
      </section>
    </div>;
  }
});

module.exports = Preferences;