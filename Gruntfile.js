'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/* <%= pkg.name %> - v<%= pkg.version %>\n' +
            ' * <%= pkg.homepage %>\n' +
            ' * (c) <%= grunt.template.today("yyyy") %> <%= pkg.authors %>\n' +
            ' * licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n',
    // Task configuration.
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      logci: {
        src: ['logci.js', 'lib/*.js']
      },
      test: {
        src: ['test/*.js']
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      logci: {
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
      }
    },
    jasmine: {
      logci: {
        src: 'logci.js',
        options: {
          specs: 'test/jasmine_test.js'
        }
      }
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Build a distributable release
  grunt.registerTask('build', ['jshint', 'uglify']);
  grunt.registerTask('test', ['jasmine']);
  grunt.registerTask('default', ['jshint', 'uglify', 'jasmine']);

};
