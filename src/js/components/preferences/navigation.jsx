var React = require('react');
var NavigationItem = require('./navigation-item');

var Navigation = React.createClass({ 
  getDefaultProps: function() {
    return {
      selected: 'profile',
      items:[{
        key: 'profile',
        icon: 'user'
      }, {
        key: 'media',
        name: 'Audio / Video',
        icon: 'audio'
      }]
    }
  },
  
  render: function(){
    var list = [];
    var selected_item = this.props.selected || 'profile';
    
    this.props.items.forEach(function(i){
      var selected = (i.key == selected_item);
      list.push(<NavigationItem key={i.key} value={i.key} name={i.name} icon={i.icon} selected={selected} disabled={i.auth && !this.props.auth} />);
    }.bind(this));
    
    return <ul className="navigation list">{list}</ul>;
  }
});

module.exports = Navigation;