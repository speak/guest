var React = require('react');
var classNames = require('classnames');
var Formsy = require('formsy-react');

var Input = React.createClass({
  mixins: [Formsy.Mixin],

  changeValue: function (event) {
    this.setValue(event.currentTarget.value);
  },
  
  render: function () {
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

    // An error message is returned ONLY if the component is invalid
    // or the server has returned an error message
    var errorMessage = this.getErrorMessage();

    return (
      <div className={classes}>
        <input {...this.props} onChange={this.changeValue} value={this.getValue()}/>
        <span className="validation">{errorMessage}</span>
      </div>
    );
  }
});

module.exports = Input;