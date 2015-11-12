var React = require('react');

var SelectInput = React.createClass({

    getDefaultProps: function() {
      return {
        multiple: false
      }
    },

    render: function() {
      // the default value for the <select> (selected for ReactJS)
      // http://facebook.github.io/react/docs/forms.html#why-select-value
      var defaultValue = this.props.value;
      
      var options = this.props.options.map(function(opt, i) {
        
        // if this is the selected option, set the <select>'s defaultValue
        if (opt.selected === true || opt.selected === 'selected') {
          // if the <select> is a multiple, push the values
          // to an array
          if (this.props.multiple) {
            if (defaultValue === undefined) {
              defaultValue = [];
            }
            defaultValue.push(opt.value);
          }
        }
        
        return <option key={i} value={opt.value} label={opt.label}>{opt.label}</option>;
      }.bind(this), this);
 
      return <select value={defaultValue} {...this.props}>{options}</select>;
    }
});

module.exports = SelectInput;