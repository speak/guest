module.exports = {
  environment: 'staging',
  report_errors: false,
  hosts: {
    wss: 'wss://staging-socks.speak.io',
    app: 'https://staging-go.speak.io',
    bulldog: 'https://staging-bulldog.speak.io',
    api: 'https://staging-api.speak.io',
    twoface: 'http://staging-mcu.speak.io:9999',
  },
  storage: {
    photos: 'speak-staging-photos'
  },
  tokens: {
    sentry: 'https://6eec4872a99f4a379f856829b7b9ab16:061bd343010646cd8013c82bf8ea337c@app.getsentry.com/39377'
  }
}
