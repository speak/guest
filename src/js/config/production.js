module.exports = {
  environment: 'staging',
  report_errors: false,
  hosts: {
    wss: 'wss://socks.speak.io',
    app: 'https://go.speak.io',
    bulldog: 'https://bulldog.speak.io',
    api: 'https://api.speak.io',
    twoface: 'http://mcu.speak.io',
  },
  storage: {
    photos: 'speak-production-photos'
  },
  tokens: {
    sentry: 'https://6eec4872a99f4a379f856829b7b9ab16:061bd343010646cd8013c82bf8ea337c@app.getsentry.com/39377'
  }
}
