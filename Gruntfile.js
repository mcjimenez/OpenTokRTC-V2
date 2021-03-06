'use strict';

module.exports = function(grunt) {

  // To-Do check what we need and add/remove as needed...
  [
    'grunt-autoprefixer',
    'grunt-contrib-clean',
//    'grunt-contrib-compress',
//    'grunt-contrib-connect',
//    'grunt-contrib-copy',
    'grunt-contrib-less',
    'grunt-contrib-watch',
    'grunt-mocha-test', // Server side test runner
    'grunt-bower-task',
    'grunt-gitinfo',
    'grunt-karma' // Client side test runner.
  ].forEach(grunt.loadNpmTasks);

  grunt.loadTasks('tasks');

  // To create HTML test files from a template. To-Do: Dunno if this is even needed or not
  var TEST_BASE_DIR = 'test/';

  grunt.initConfig({

    mochaTest: {
      unit: {
        options: {
          reporter: 'spec',
          captureFile: 'resultsUnit.txt',
          quiet: false,
          clearRequireCache: false
        },
        src: ['test/unit/server/**/*.js']
      },
      rest: {
        options: {
          reporter: 'spec',
          captureFile: 'resultsRest.txt',
          quiet: false,
          clearRequireCache: false
        },
        src: ['test/api/**/*.js']
      }
    },

    bower: {// grunt.file.setBase('test');
      install: {
        options: {
          targetDir: './lib',
          layout: 'byType',
          install: true,
          verbose: false,
          cleanTargetDir: false,
          cleanBowerDir: true,
          bowerOptions: {}
        }
      }
    },

    karma: {
      options: {
	configFile: 'karma.conf.js'
      },
      integration: {
	singleRun: true
      },
      dev: {
      }
    },

    clean: { // To-Do: Configure this!
      server: [
        '.tmp'
      ],
      postTest: [
        'test/gtest_*.html'
      ]
    },

    'gitinfo': {
      options: {
        cwd: '.'
      }
    },

    less: {
      default: {
        files: {
          'web/css/landing.opentok.css': 'web/less/landing.less',
          'web/css/room.opentok.css': 'web/less/room.less'
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 5 versions']
      },
      dist: {
        src: 'web/css/*.css'
      }
    },

    watch: {
      styles: {
        files: ['../../**/*.less'],
        tasks: ['less', 'autoprefixer'],
        options: {
          nospawn: true,
          livereload: {
            port: 35730
          }
        }
      }
    }

  });

  grunt.registerTask('clientBuild', 'Build css files', [
    'less',
    'autoprefixer'
  ]);

  grunt.registerTask('clientDev', 'Watch for changes on less files', [
    'clientBuild',
    'watch'
  ]);

  grunt.registerTask('clientTest', 'Launch client unit tests in shell with Karma + PhantomJS', [
    'karma:dev'
  ]);

  grunt.registerTask('precommit', 'Run precommit tests', [
    'karma:integration'
  ]);
  
  grunt.registerTask('serverUnitTest', 'Launch server unit tests', [
    'clean:server',
    'mochaTest:unit'
  ]);

  grunt.registerTask('RESTApiTest', 'Launch server unit tests', [
    'clean:server',
    'mochaTest:rest'
  ]);

  grunt.registerTask('test', 'Launch server unit tests', [
    'serverUnitTest',
    'RESTApiTest',
    'clientTest'
  ]);

  grunt.registerTask('configTests', [
    'preBowerInstall',
    'bower:install',
    'postBowerInstall'
  ]);

  grunt.registerTask('default', ['test']);
};
