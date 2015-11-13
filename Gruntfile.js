module.exports = function(grunt) {
  var target = "development";
  if (grunt.option('staging')) target="staging";
  if (grunt.option('production') || grunt.option('prod')) target="production";
  
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-css-url-embed');

  if (target == "production") {
    var tasks = ['copy', 'browserify', 'uglify', 'less', 'cssUrlEmbed']
  } else {
    var tasks = ['copy', 'browserify', 'less', 'cssUrlEmbed']
  }
  grunt.registerTask('build', tasks);
  
  grunt.initConfig({
    browserify: {
      all: {
        options: {
          browserifyOptions: {
            extensions: ['.jsx', '.js'],
            transform: ['babelify', ['aliasify', {
              aliases: {
                "config": "./src/js/config/"+target+".js"
              }
            }]]
          }
        },
        files: [{
          expand: true,
          cwd: 'src',
          src: ['js/guest.js'],
          dest: './build'
        }]
      }
    },
    less: {
      all: {
        files: {
          "build/css/guest.css": "src/less/*.css.less"
        }
      }
    },
    cssUrlEmbed: {
      encodeDirectly: {
        files: {
          'build/css/guest.css': ['build/css/guest.css']
        }
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapIncludeSources: true
      },
      all: {
        files: {
          "build/js/guest.js": "build/js/guest.js"
        }
      }
    },
    watch: {
      js: {
        files: ['src/**/*.jsx', 'src/**/*.js'],
        tasks: ['browserify']
      },
      less: {
        files: ['src/less/*'],
        tasks: ['less']
      },
      html: {
        files: ['src/html/*', 'src/sounds/*'],
        tasks: ['copy']
      },
      images: {
        files: ['src/images/*'],
        tasks: ['copy', 'less', 'cssUrlEmbed']
      }
    },
    copy: {
      html: {
        expand: true,
        flatten: false,
        cwd: 'src/html',
        src: ['*'],
        dest: 'build/'
      },
      images: {
        expand: true,
        flatten: false,
        cwd: 'src/images',
        src: ['**/*'],
        dest: 'build/images/'
      },
      sounds: {
        expand: true,
        flatten: false,
        cwd: 'src/sounds',
        src: ['**/*'],
        dest: 'build/sounds/'
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['browserify']);
};
