module.exports = {
  environment: 'development',
  report_errors: false,
  hosts: {
    ws: 'ws://docker:4000',
    wss: 'wss://docker:4000',
    app: 'http://docker:5002',
    bulldog: 'http://docker:9393',
    api: 'http://docker:4444',
    twoface: 'http://docker:9999'
  },
  storage: {
    photos: 'speak-development-photos'
  },
  tokens: {
    sentry: 'https://6eec4872a99f4a379f856829b7b9ab16:061bd343010646cd8013c82bf8ea337c@app.getsentry.com/39377'
  }
}
