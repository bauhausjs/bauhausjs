var gulp = require('./gulp');

function Build (options) {
    this.gulp = null;
    this.options = {
        env: options.env || process.env.NODE_ENV,
        html: {
            src:  (options.html && options.html.src)  ? options.html.src : [],
            dest: (options.html && options.html.dest) ? options.html.dest : __dirname + '/build'
        },
        js: {
            src:  (options.js && options.js.src)  ? options.js.src : [],
            dest: (options.js && options.js.dest) ? options.js.dest : __dirname + '/build/js',
            concat: (options.js && options.js.concat)  ? options.js.concat : 'all.js'
        },
        css: {
            src:  (options.css && options.css.src)  ? options.css.src : [],
            concat: (options.css && options.css.concat)  ? options.css.concat : 'all.css',
            dest: (options.css && options.css.dest) ? options.css.dest : __dirname + '/build/css'
        },
        less: {
            src:  (options.less && options.less.src)  ? options.less.src : [],
            paths: (options.less && options.less.paths)  ? options.less.paths : [],
        }
    };
};

Build.prototype.addSrc = function (type, src) {
    var sources = (typeof src === 'string') ? [src] : src;

    if (this.options[type] && this.options[type].src && Array.isArray(this.options[type].src)) {
        for (var s in sources) {
            this.options[type].src.push(sources[s])
        }
    }
};

Build.prototype.initGulp = function () {
    this.gulp = gulp(this.options);
};

Build.prototype.run = function (tasks) {
    this.gulp.start.apply(this.gulp, tasks);
};

module.exports = Build;

