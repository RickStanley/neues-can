module.exports = function (gulp, callback) {
    return gulp.src(gulp.opts.src.fonts)
            .pipe(gulp.dest(gulp.opts.dest.fonts));
};