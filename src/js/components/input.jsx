var React = require('react');
var classNames = require('classnames');
var Formsy = require('formsy-react');
var $ = require('jquery');

var Input = React.createClass({
  mixins: [Formsy.Mixin],

  changeValue: function (event) {
    this.setValue(event.currentTarget.value);
  },
  
  getDefaultProps: function() {
    return {
      wrapperClass: ""
    }
  },
  
  closeNotification: function() {
    $(this.refs.wrapper).fadeOut();
  },
  
  render: function () {
    var notif, label;
    
    // Set a specific className based on the validation
    // state of this component. showRequired() is true
    // when the value is empty and the required prop is
    // passed to the input. showError() is true when the
    // value typed is invalid
    var classes = classNames({
      'input-wrapper': true,
      'required': this.showRequired(),
      'error': this.showError()
    });
    
    if (this.props.label) {
      label = <label>{this.props.label}</label>;
    }
    
    if (this.props.notice) {
      notif = <div className="notice-wrapper" ref="wrapper" onClick={this.closeNotification}>
                <div className="notice slideFadeDown">
                  {this.props.notice}
                </div>
              </div>
    }
    
    // An error message is returned ONLY if the component is invalid
    // or the server has returned an error message
    var errorMessage = this.getErrorMessage();
    if (errorMessage) {
      notif = <div className="error-wrapper">
                <div className="error slideFadeDown">
                  <span className="validation">{errorMessage}</span>
                </div>
              </div>
    }

    return (
      <div className={classes + " " + this.props.wrapperClass}>
        {label}
        <input {...this.props} onChange={this.changeValue} value={this.getValue()}/>
        {notif}
      </div>
    );
  }
});

module.exports = Input;