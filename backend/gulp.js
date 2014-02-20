var gulp = require('gulp'),
    gulpless = require('gulp-less'),
    gulpconcat = require('gulp-concat'),
    gulpinject = require('gulp-inject'),
    gulpuglify = require('gulp-uglify'),
    gulpreplace = require('gulp-replace'),
    gulputil = require('gulp-util'),
    es = require('event-stream'),
    lr = require('tiny-lr'),
    path = require('path'),
    livereload = require('gulp-livereload'),
    server = lr();

module.exports = function (config) {
    // cache name of output scripts and styles to inject them into html
    var scriptCache = [],
        styleCache = [],
        watcherStarted = false;

    gulp.task('styles', function () {
        styleCache = [];
        return es.merge(
            gulp.src(config.css.src),
            gulp.src(config.less.src)
                .pipe(gulpless({ paths: config.less.paths }))
        ).pipe(gulpconcat(config.css.concat))
         .pipe(gulp.dest(config.css.dest))
         .pipe((config.env === 'development' && watcherStarted) ? livereload(server) : gulputil.noop())
         .pipe(gulputil.buffer(function(err, files){
              for (var f in files) {
                  styleCache.push(files[f].path);
              }
          }));
    });

    gulp.task('scripts', function () {
        scriptCache = [];
        return gulp.src(config.js.src)
                   //.pipe((config.env === 'production') ? gulpuglify() :  gulputil.noop())
                   .pipe((config.env === 'production') ? gulpconcat(config.js.concat) : gulputil.noop())
                   .pipe(gulp.dest(config.js.dest))
                   .pipe((config.env === 'development' && watcherStarted) ? livereload(server) : gulputil.noop())
                   .pipe(gulputil.buffer(function(err, files){
                        for (var f in files) {
                            scriptCache.push(files[f].path);
                        }
                    }));
    });

    gulp.task('html', function () {
        return gulp.src(config.html.src)
                   .pipe(gulp.dest(config.html.dest))
                   .pipe((config.env === 'development' && watcherStarted) ? livereload(server) : gulputil.noop());
    });

    gulp.task('copy', function () {
        return gulp.src(config.copy.src)
                   .pipe(gulp.dest(config.copy.dest))
                   .pipe((config.env === 'development' && watcherStarted) ? livereload(server) : gulputil.noop());
    });

    gulp.task('index.ejs', ['scripts'], function (src) {
        var indexSrc = __dirname + '/templates/index.ejs',
            indexDest = __dirname + '/build/templates/';

        var assetScr = styleCache.concat(scriptCache);

        var angularModules = '["' + config.angular.modules.join('","') + '"]';
	var ignorePaths = [];
	ignorePaths.push( path.join(__dirname, '/build/client/'));
	ignorePaths.push( ignorePaths[0].split(path.sep).join('/') );
	console.log("path", ignorePaths);
        return gulp.src(assetScr, {read: false})
            .pipe(gulpinject(indexSrc, { ignorePath: ignorePaths, addRootSlash: false }))
            .pipe(gulpreplace(/(angular\.module\(\'bauhaus\'\, )(\[\])(\))/, '$1' + angularModules + '$3'))
            .pipe(gulp.dest(indexDest));
    });
	
    gulp.task('watch', ['styles', 'scripts', 'html'], function () {
        watcherStarted = true;
        gulp.watch(config.css.src, ['styles']);
        gulp.watch(config.less.src, ['styles']);
        gulp.watch(config.js.src, ['scripts']);
        gulp.watch(config.html.src, ['html']);
        gulp.watch(config.copy.src, ['copy']);

        server.listen(35729, function(err) {
            if (err) return console.error(err);
        });
    });


    gulp.task('production', ['styles', 'scripts', 'html', 'copy', 'index.ejs']);

    gulp.task('development', ['styles', 'scripts', 'html', 'copy', 'index.ejs', 'watch']);

    return gulp;
}
