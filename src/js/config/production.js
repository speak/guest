module.exports = {
  environment: 'production',
  report_errors: true,
  hosts: {
    ws: 'wss://socks.speak.io',
    app: 'https://go.speak.io',
    account: 'https://account.speak.io',
    bulldog: 'https://bulldog.speak.io',
    api: 'https://api.speak.io',
    twoface: 'https://mcu.speak.io',
  },
  storage: {
    photos: 'speak-production-photos'
  },
  tokens: {
    tokbox_api_key: 45222812,
    sentry: 'https://6eec4872a99f4a379f856829b7b9ab16@app.getsentry.com/39377'
  }
}
