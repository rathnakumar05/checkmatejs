module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                files: {
                    'dist/CheckMate.js': 'src/index.js'
                },
                options: {
                    banner: '/*! <%= pkg.name %> - <%= pkg.homepage %>' + '<%= grunt.template.today(\'yyyy-mm-dd\') %> */',
                    browserifyOptions: {
                        standalone: 'CheckMate'
                    }
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'dist/CheckMate.js',
                dest: 'dist/', 
                expand: true,
                flatten: true,
                ext: '.min.js'
            }
        },
        watch: {
            scripts: {
                files: ['src/*.js'],
                tasks: ['browserify', 'uglify'],
                options: {
                    spawn: false
                }
            }
        },
     
    });
  
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
  
    grunt.registerTask('build', ['browserify', 'uglify']);
    grunt.registerTask('default', ['browserify', 'uglify', 'watch']);
  };
  