const cached = require('gulp-cached'),
    imagemin = require('gulp-imagemin');
module.exports = function (gulp, callback) {
    return gulp.src(gulp.opts.src.images)
        .pipe(cached('img-cache'))
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 2
            }),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false
                }]
            })
        ], {
            verbose: true
        }))
        .pipe(gulp.dest(gulp.opts.dest.images));
};