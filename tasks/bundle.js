const buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify');

module.exports = function (gulp, plugins) {
    const bundlers = require('./setBundles')(gulp, plugins);
    if (!gulp.opts.env.justbuild) {
        return bundlers.forEach(function (element) {
            let watching = watchify(element.b);
            watching.on('update', function () {
                watching.bundle()
                    .on('error', gulp.opts.swallowError)
                    .pipe(source(element.fileName + '.bundle.js'))
                    .pipe(buffer())
                    .pipe(plugins.if(!gulp.opts.env.isProduction, plugins.sourcemaps.init()))
                    .pipe(plugins.uglify())
                    .on('error', gulp.opts.swallowError)
                    .pipe(plugins.if(!gulp.opts.env.isProduction, plugins.sourcemaps.write('./')))
                    .pipe(gulp.dest(gulp.opts.dest.js));
            });
            return watching;
        });
    }
};