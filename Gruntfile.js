'use strict';

module.exports = function (grunt) {

    // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %>' +
            ' - <%= pkg.homepage %>' +
            ' - (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>' +
            ' - licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      logci: {
        src: 'logci.js'
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
    connect: {
      test: {
        port: 8000,
        keepalive: true
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Build a distributable release
  grunt.registerTask('build', ['jshint', 'uglify']);

};
