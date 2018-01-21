module.exports = function (gulp, plugins) {
    return function () {
        gulp.src(gulp.opts.src.VENDORS)
            .pipe(plugins.concat('vendors.js'))
            .pipe(plugins.if(!gulp.opts.env.isProduction, plugins.sourcemaps.init()))
            .pipe(plugins.uglify())
            .pipe(plugins.if(!gulp.opts.env.isProduction, plugins.sourcemaps.write('./')))
            .pipe(gulp.dest(gulp.opts.dest.js));
    };
};