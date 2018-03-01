const concat = require('gulp-concat'),
    gulpIf = require('gulp-if'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps');
module.exports = function (gulp, callback) {
    return gulp.src(gulp.opts.src.VENDORS)
        .pipe(concat('vendors.js'))
        .pipe(gulpIf(!gulp.opts.env.isProduction, sourcemaps.init()))
        .pipe(uglify())
        .pipe(gulpIf(!gulp.opts.env.isProduction, sourcemaps.write('./')))
        .pipe(gulp.dest(gulp.opts.dest.js));
};