module.exports = function (gulp, plugins) {
    return function () {
        gulp.src(gulp.opts.src.fonts)
            .pipe(gulp.dest(gulp.opts.dest.fonts));
    };
};