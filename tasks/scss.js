const sass = require('gulp-sass'),
    gulpIf = require('gulp-if'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    hash = require('gulp-hash'),
    sourcemaps = require('gulp-sourcemaps');
module.exports = function (gulp, callback) {
    return gulp.src(gulp.opts.src.css.main)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpIf(gulp.opts.env.isProduction, hash()))
        .pipe(gulpIf(!gulp.opts.env.isProduction, sourcemaps.init()))
        .pipe(autoprefixer())
        .pipe(cleanCss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulpIf(!gulp.opts.env.isProduction, sourcemaps.write('./')))
        .pipe(gulp.dest(gulp.opts.dest.css))
        .pipe(hash.manifest(gulp.opts.dest.root + '/assets.json', {
            deletOld: true,
            sourceDir: __dirname + '/' + gulp.opts.dest.root + '/css'
        }))
        .pipe(gulp.dest('.'));
};