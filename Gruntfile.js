module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    browserify: {
      dist: {
        files: {
          "dist/CheckMate.js": "src/index.js",
        },
        options: {
          banner: "/*! <%= pkg.name %> v<%= pkg.version%> */\n",
          browserifyOptions: {
            standalone: "CheckMate",
          },
        },
      },
    },
    uglify: {
      options: {
        banner: "/*! <%= pkg.name %> v<%= pkg.version%> */\n",
      },
      build: {
        src: "dist/CheckMate.js",
        dest: "dist/",
        expand: true,
        flatten: true,
        ext: ".min.js",
      },
    },
    watch: {
      scripts: {
        files: ["src/*.js"],
        tasks: ["browserify", "uglify"],
        options: {
          spawn: false,
        },
      },
    },
  });

  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("build", ["browserify", "uglify"]);
  grunt.registerTask("default", ["browserify", "uglify", "watch"]);
};
