'use strict'
 
module.exports = (grunt) ->
 
  # Project configuration.
  grunt.initConfig
 
    # Task configuration.

    coffee:
      dist: 
        options:
          bare: true
        files:
          'lib/app.js': 'src/app.coffee'
          'lib/routes.js': 'src/routes.coffee'
          'lib/twitter-watcher.js': 'src/twitter-watcher.coffee'

    
    watch:
      coffee:
        files: ['src/*.coffee']
        tasks: ['coffee']
 
 
  # These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-coffee')
 
  # Default task.
  grunt.registerTask('default', ['coffee'])