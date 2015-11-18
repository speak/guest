var React = require('react');
var Rating = require('react-icon-rating');
var Analytics = require('../libs/analytics');

var CallCompleted = React.createClass({
  
  getInitialState: function() {
    return {
      rated: false
    }
  },

  handleRating: function(number) {
    Analytics.track('channel.rating', {
      id: this.props.channel.id,
      rating: number
    });
    
    this.setState({rated: number});
  },
  
  getContent: function() {
    if (this.state.rated === false) {
      return <div>
        <h2>How was the call?</h2>
        <p>Help us improve Speak by rating the quality of <br/>your call, or <a href="mailto:howdy@speak.io">send us an email</a> with feedback!</p>
        <Rating className="rating" onChange={this.handleRating} toggledClassName="icon icon-star" untoggledClassName="icon icon-star-empty"/>
      </div>;
    } else if (this.state.rated < 3) {
      return <div>
        <h2>That&#39;s not good</h2>
        <p>Consider <a href="mailto:howdy@speak.io">dropping us a line</a> to let us know about the problems you had?</p>
      </div>;
    } else if (this.state.rated < 5) {
      return <div>
        <h2>Thanks for rating</h2>
        <p>We hope you enjoyed using Speak, if you have ideas for improvements be sure to <a href="mailto:howdy@speak.io">let us know</a>.</p>
      </div>;
    } else {
      return <div>
        <h2>A perfect call!</h2>
        <p>Wow, you&#39;re just emitting positivity! Consider letting someone know about your Speak experience?</p>
      </div>;
    }
  },
  
  render: function() {
    return <div id="call-completed">
      {this.getContent()}
    </div>;
  }
});

module.exports = CallCompleted;