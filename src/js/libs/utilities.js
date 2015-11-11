var md5 = require('MD5');
var Config = require('config');
var $ = require('jquery');
var requestCount = 0;

module.exports = {
  guid: function() {
    var s4 = function() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  },
  
  generateTransactionId: function() {
    return md5(localStorage.getItem('device_id') + (new Date()).getTime() + (requestCount++));
  },
  
  getScreenshareExtensionUrl: function() {
    return $('link[rel=chrome-webstore-item]').attr('href');
  },
  
  getScreenshareExtensionId: function() {
    if (Config.environment == 'development') {
      return 'kejgjfgcblcdakmblmecpljgiocdgkha';
    }
    
    var url = this.getScreenshareExtensionUrl();
    var parts = url.split("/");
    return parts[parts.length-1];
  }
};

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

// https://github.com/sindresorhus/camelcase
String.prototype.camelCase = function() {
  str = this;
  str = str.trim();

  if (str.length === 1 || !(/[_.\- ]+/).test(str) ) {
    return str;
  }

  return str
  .replace(/^[_.\- ]+/, '')
  .toLowerCase()
  .replace(/[_.\- ]+(\w|$)/g, function (m, p1) { 
    return p1.toUpperCase();
  });
};

String.prototype.camelCaseToSentence = function() {
  return this.replace(/^[a-z]|[A-Z]/g, function(v, i) {
    return i === 0 ? v.toUpperCase() : " " + v.toLowerCase();
  });
};

String.prototype.snakeCaseToSentence = function() {
  return this.replace(/\_/g, " ").capitalize();
};