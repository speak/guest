var _ = require('underscore');
var Config = require('config');
var SocksActions = require('../actions/socks-actions');
var md5 = require('MD5');

var Socks = {
  
  connected: false,
  connecting: false,
  manuallyClosed: false,    // true if we closed with no need to reconnect
  configReceived: false,
  
  reconnectTimeout: null,
  reconnectInterval: 1000,  // Starting point for reconnection attempts
  reconnectDecay: 1.5,      // The rate of increase of the reconnect delay. Allows reconnect attempts to back off
  reconnectAttempts: 0,     // The number of attempted reconnects since starting, or the last successful connection
  timeoutInterval: 5000,    // The maximum time in ms to wait for a connection to succeed before closing and retrying
  queue: [],
  
  actions: {
    'app.online':                         'reconnect',
    'session.created':                    'connect',
    'session.error':                      'disconnect',
    'session.destroy':                    'disconnect',
    'organization.create':                'send',
    'signaling.audio_offer':              'send',
    'signaling.audio_ice':                'send',
    'user.configure':                     'send',
    'user.stop_speaking':                 'send',
    'user.start_speaking':                'send',
    'user.update':                        'send',
    'user.delete':                        'send',
    'channel.auth':                       'send',
    'channel.update':                     'send',
    'channel.join':                       'send',
    'channel.kick':                       'send',
    'channel.leave':                      'send',
    'channel.invite':                     'send',
    'channel.accept':                     'send',
    'channel.cancel':                     'send',
    'channel.decline':                    'send',
    'channel.timeout':                    'send',
    'invite.create':                      'send',
    'invite.delete':                      'send',
    'invite.resend':                      'send',
    'invite.accept':                      'send',
    'analytics.track':                    'send',
    'video.publish':                      'send',
    'video.unpublish':                    'send',
    'screen.publish':                     'send',
    'screen.unpublish':                   'send'
  },
  
  queueable: [
    'user.update',
    'analytics.track',
  ],
  
  connect: function(ticket) {
    _.bindAll(this, 'onopen', 'onclose', 'onmessage');
    console.log('Socks:connect', ticket);
    
    this.connecting = true;
    this.manuallyClosed = false;
    this.configReceived = false;
    
    delete this.ws;
    // this.ws = new WebSocket(Config.hosts.ws + "?ticket=" + ticket + "&version=" + app.getVersion() + "&platform=" + window.process.platform);
    this.ws = new WebSocket(Config.hosts.ws + "?ticket=" + ticket);
    this.ws.onopen = this.onopen;
    this.ws.onclose = this.onclose;
    this.ws.onmessage = this.onmessage;
    
    var self = this;
    this.reconnectTimeout = setTimeout(function() {
      self.ws.close();
    }, this.timeoutInterval);
  },
  
  disconnect: function() {
    if (this.ws) this.ws.close();
    this.connecting = false;
    this.connected = false;
    this.manuallyClosed = true;
    this.configReceived = false;
  },
  
  send: function(action, params, options) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      var data = {key: action};
      
      if (params) data.params = params;
      if (options) data.transaction_id = options;
      console.log('Socks sending', action, data, options);
      
      this.ws.send(JSON.stringify(data));
      return true;
    }
    
    if (_.contains(this.queueable, action)) {
      this.queue.push([action, params, options]);
      console.log("Message queued for sending", action, params);
    } else {
      console.warn("Message not sent, no websocket connection", action, params);
    }
    
    return false;
  },
  
  reconnect: function() {
    if (!this.connected) {
      this.reconnectAttempts = 0;
      SocksActions.reconnect();
    }
  },
  
  onopen: function() {
    this.connected = true;
    this.connecting = false;
    this.reconnectAttempts = 0;
    
    SocksActions.connected();
    
    // process queue
    while(this.queue.length > 0) {
      this.send.apply(this, this.queue.shift())
    }
  },
  
  onclose: function(ev) {
    clearTimeout(this.reconnectTimeout);
    
    this.connected = false;
    this.connecting = false;
    SocksActions.disconnected();

    
    // we've logged in elsewhere.
    if (ev.code == 1001 || ev.code > 3999) {
      SocksActions.closed(ev);

    // if we didn't close lets setup our reconnection attempt
    } else if(!this.manuallyClosed) {
      var self = this;
      
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(function() {
        self.reconnectAttempts++;
        SocksActions.reconnect();
      }, this.reconnectInterval * Math.pow(this.reconnectDecay, this.reconnectAttempts));
    }
  },
  
  onmessage: function(event) {
    var message = JSON.parse(event.data);

    message.params = message.params || {};
    
    if (message.key) {
      if (message.key == 'user.configuration') {
        this.configReceived = true;
        clearTimeout(this.reconnectTimeout);
      }
      
      if (message.key == 'ping') {
        this.send('pong');
      }

      if (this.configReceived) {
        var parts = message.key.split('.');
        if (parts.length === 3) {
          var key = parts[0]+"."+parts[1]
        } else {
          var key = message.key
        }
        SocksActions.message(key, message.params, message.transaction_id);
      }
    } else {
      console.warn('unknown message received', message);
    }
  },

  
  dispatchAction: function(action, payload) {
    var callback = this.actions[action];
    
    // fallback to .* callback
    if (!callback) {
      var parts = action.split('.');
      if (parts.length === 3) {
        callback = this.actions[parts[0]+"."+parts[1]];
      }
    }
    
    if (callback) {
      // the 'send' callback gets all of the arguments passed through
      if (callback == 'send') return this[callback].apply(this, arguments);
      return this[callback].call(this, payload);
    }
  }
};

module.exports = Socks;
