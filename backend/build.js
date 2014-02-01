var gulp = require('gulp'),
    gulpless = require('gulp-less'),
    gulpconcat = require('gulp-concat'),
    es = require('event-stream'),
    lr = require('tiny-lr'),
    livereload = require('gulp-livereload'),
    server = lr();

module.exports = function (options) {
    var config = {
        env: options.env || process.env.NODE_ENV,
        html: {
            src:  (options.html && options.html.src)  ? options.html.src : [__dirname + '/client/javascript/**/*.html'],
            dest: (options.html && options.html.dest) ? options.html.dest : __dirname + '/build'
        },
        js: {
            src:  (options.js && options.js.src)  ? options.js.src : [__dirname + '/client/javascript/**/*.js'],
            dest: (options.js && options.js.dest) ? options.js.dest : __dirname + '/build/js'
        },
        css: {
            src:  (options.css && options.css.src)  ? options.css.src : '',
            concat: (options.css && options.css.concat)  ? options.css.concat : 'all.css',
            dest: (options.css && options.css.dest) ? options.css.dest : __dirname + '/build/css'
        },
        less: {
            src:  (options.less && options.less.src)  ? options.less.src : [],
            paths: (options.less && options.less.paths)  ? options.less.paths : [],
        }
    };

    gulp.task('styles', function () {
        var styles = es.merge(
            gulp.src(config.css.src),
            gulp.src(config.less.src)
                .pipe(gulpless({ paths: config.less.paths }))
        ).pipe(gulpconcat(config.css.concat))
         .pipe(gulp.dest(config.css.dest));

        if (config.env === 'development') {
            styles.pipe(livereload(server))
        }
        return styles;
    });

    gulp.task('scripts', function () {
        var scripts = gulp.src(config.js.src)
                   .pipe(gulp.dest(config.js.dest));

        if (config.env === 'development') {
            scripts.pipe(livereload(server))
        }
        return scripts;
    });

    gulp.task('html', function () {
        var html = gulp.src(config.html.src)
                   .pipe(gulp.dest(config.html.dest));

        if (config.env === 'development') {
            html.pipe(livereload(server))
        }
        return html;
    });

    gulp.task('watch', function () {
        gulp.watch(config.css.src, ['styles']);
        gulp.watch(config.less.src, ['styles']);
        gulp.watch(config.js.src, ['scripts']);
        gulp.watch(config.html.src, ['html']);

        server.listen(35729, function(err) {
            if (err) return console.error(err);
        });
    });

    gulp.task('production', ['styles', 'scripts']);

    gulp.task('development', ['styles', 'scripts', 'html', 'watch']);

    return gulp;
}