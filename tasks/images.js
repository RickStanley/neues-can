module.exports = function (gulp, plugins) {
    return function () {
        gulp.src(gulp.opts.src.images)
            .pipe(plugins.cached('img-cache'))
            .pipe(plugins.imagemin([
                plugins.imagemin.gifsicle({
                    interlaced: true
                }),
                plugins.imagemin.jpegtran({
                    progressive: true
                }),
                plugins.imagemin.optipng({
                    optimizationLevel: 5
                }),
                plugins.imagemin.svgo({
                    plugins: [{
                        removeViewBox: true
                    }]
                })
            ], {
                verbose: true
            }))
            .pipe(gulp.dest(gulp.opts.dest.images));
    };
};