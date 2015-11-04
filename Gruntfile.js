module.exports = function(grunt) {
  var target = "development";
  if (grunt.option('staging')) target="staging";
  if (grunt.option('production') || grunt.option('prod')) target="production";
  
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('build', ['copy', 'browserify', 'less']);
  
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
    watch: {
      js: {
        files: ['src/**/*.jsx', 'src/**/*.js'],
        tasks: ['browserify']
      },
      less: {
        files: ['src/less/*'],
        tasks: ['less']
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
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['browserify']);
};
