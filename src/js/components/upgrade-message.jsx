var React = require('react');

var UpgradeContent = React.createClass({
  render: function() {
    return <div id="upgrade" className="centered">
      <h2>Upgrade to Speak Pro</h2>
      <p>Unlimited access to all of Speak’s premium features</p>
      
      <div className="container features">
          <div className="one-third column feature">
            <img src="/images/camera@2x.png" width="44" height="35" />
            <h4>Call Recording</h4>
            <p>
              Record your meetings so you can review them later or share with
              those that couldn&#39;t attend.
            </p>
          </div>
          <div className="one-third column feature">
            <img src="/images/brush@2x.png" width="44" height="35" />
            <h4>Custom Branding</h4>
            <p>
              Give your customers a more personal experience by custom branding your Speak meeting.
            </p>
          </div>
          <div className="one-third column feature">
            <img src="/images/plane@2x.png" width="44" height="35" />
            <h4>File Sharing</h4>
            <p>
              Speak includes encrypted p2p file sharing within your web browser, nice!
            </p>
          </div>
      </div>
    
      <input type="submit" value="Upgrade Now!" className="button primary" onClick={this.props.toggleComingSoon} />
    </div>;
  }
});

module.exports = UpgradeContent;