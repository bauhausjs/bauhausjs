module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            less: {
                files: ['client/css/*.less'],
                tasks: ['less:development'],
                options: {
                    interrupt: true,
                    spawn: false
                }
            },
            livereload: {
                files: ['public/**/*'],
                options: {
                    livereload: true,
                    spawn: true
                }
            }
        },

        less: {
            development: {
                options: {
                    paths: ['client/css/'] 
                },
                files: {
                    'public/css/all.css': 'client/css/all.less'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['less:development'])
}