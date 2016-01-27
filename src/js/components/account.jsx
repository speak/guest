var React = require('react');
var Input = require('./input');
var Formsy = require('formsy-react');
var Flux = require('delorean').Flux;

var Account = React.createClass({
  mixins: [Flux.mixins.storeListener],

  watchStores: ['usersStore', 'appStore'],
  
  getInitialState: function() {
    return {
      can_submit: true,
      saving: false
    }
  },
  
  handleSubmit: function(data, reset, invalidate) {
    this.disableButton();
    this.setState({saving: true});
    
    var self = this;
    UserActions.userUpdate(data).done(function(){
      self.setState({saving: false, can_submit: true});
    }).fail(function(data) {
      invalidate(data.responseJSON.params);
      self.setState({saving: false});
    });
  },
  
  enableButton: function() {
    this.setState({can_submit: true});
  },

  disableButton: function() {
    this.setState({can_submit: false});
  },
  
  getButtonText: function() {
    return this.state.saving ? "Saving" : "Save";
  },
  
  render: function() {
    var app = this.getStore('appStore');
    var users = this.getStore('usersStore');
    var user = users[app.user_id];
    var warning;
    
    if (!user.has_password || !user.email) {
      warning = <p className="warning">You currently have a temporary account. Claim it in seconds by adding an email address and password!</p>;
    }
    
    return <div id="account" className="modal-with-menu">
      <div className="content">
        <h1>Account</h1>
        <Formsy.Form onValidSubmit={this.handleSubmit} onValid={this.enableButton} onInvalid={this.disableButton}>
          {warning}
          <div className="row double">
            <Input type="text" label="Name" name="first_name" defaultValue={user.first_name} className="u-full-width" /> <Input type="text" name="last_name" label="&nbsp;" defaultValue={user.last_name} className="u-full-width" />
          </div>
          <div className="row">
            <Input type="email" label="Email" name="email" defaultValue={user.email} placeholder="Email address" className="u-full-width" />
          </div>
          <div className="row">
            <Input type="password" label="Password" name="password" placeholder="Password" className="u-full-width" />
          </div>
          <input type="submit" value={this.getButtonText()} disabled={!this.state.can_submit} className="button primary" />
        </Formsy.Form>
      </div>
    </div>;
  }
});

module.exports = Account;