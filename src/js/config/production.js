module.exports = {
  environment: 'production',
  report_errors: true,
  hosts: {
    app: 'https://go.speak.io',
    account: 'https://account.speak.io',
    api: 'https://speak-prod-api.herokuapp.com'
  },
  storage: {
    photos: 'speak-production-photos'
  },
  tokens: {
    tokbox_api_key: 45222812,
    sentry: 'https://6eec4872a99f4a379f856829b7b9ab16@app.getsentry.com/39377'
  }
}