module.exports = {
  environment: 'development',
  report_errors: false,
  hosts: {
    app: 'http://docker:5002',
    account: 'http://docker:5001',
    api: 'http://docker:8080',
  },
  storage: {
    photos: 'speak-development-photos'
  },
  tokens: {
    tokbox_api_key: 45222752,
    sentry: 'https://6eec4872a99f4a379f856829b7b9ab16@app.getsentry.com/39377'
  }
}
