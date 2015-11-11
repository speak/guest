var path = require('path');
var resourcesPath = path.normalize(__dirname + '../../..');

module.exports = {
  resources: resourcesPath,
  browser: resourcesPath + '/src/main',
  menus: resourcesPath + '/menus',
  static: resourcesPath + '/static',
  images: resourcesPath + '/static/images',
  sounds: resourcesPath + '/static/sounds',
  videos: resourcesPath + '/static/videos',
  fonts: resourcesPath + '/static/fonts',
  css: resourcesPath + '/static/css'
};
