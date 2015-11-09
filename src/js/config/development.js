module.exports = {
  environment: 'development',
  report_errors: false,
  hosts: {
    ws: 'ws://docker:4000',
    app: 'http://docker:5002',
    bulldog: 'http://docker:9393',
    api: 'http://docker:4444',
    twoface: 'http://docker:9999'
  },
  storage: {
    photos: 'speak-development-photos'
  },
  tokens: {
    tokbox_api_key: 45222752,
    sentry: 'https://6eec4872a99f4a379f856829b7b9ab16@app.getsentry.com/39377'
  }
}
