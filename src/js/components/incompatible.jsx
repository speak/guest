var React = require('react');

var Incompatible = React.createClass({
  
  render: function() {
    return <div id="incompatible">
      <h2>Browser not supported!</h2>
      <p>Speak currently supports <a href="https://www.google.com/chrome/browser/desktop/" target="_blank">Chrome</a> and <a href="https://www.mozilla.org/en-US/firefox/" target="_blank">Firefox</a>. <br/>We&#39;re working hard on supporting your browser too!</p>
    </div>;
  }
});

module.exports = Incompatible;