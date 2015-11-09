module.exports = {
  environment: 'staging',
  report_errors: false,
  hosts: {
    ws: 'wss://staging-socks.speak.io',
    app: 'https://staging-go.speak.io',
    bulldog: 'https://staging-bulldog.speak.io',
    api: 'https://staging-api.speak.io',
    twoface: 'https://staging-mcu.speak.io',
  },
  storage: {
    photos: 'speak-staging-photos'
  },
  tokens: {
    tokbox_api_key: 45222802,
    sentry: 'https://6eec4872a99f4a379f856829b7b9ab16@app.getsentry.com/39377'
  }
}