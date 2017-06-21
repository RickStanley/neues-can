'use strict';
const     gulp          = require('gulp')
        , jshint        = require('gulp-jshint')
        , clean         = require('gulp-clean')
        , concat        = require('gulp-concat')
        , uglify        = require('gulp-uglify')
        , header        = require('gulp-header')
        , runSequence   = require('run-sequence')
        , imagemin      = require('gulp-imagemin')
        , sass          = require('gulp-sass')
        , autoprefixer  = require('gulp-autoprefixer')
        , cleanCSS      = require('gulp-clean-css')
        , rename        = require('gulp-rename')
        , browserSync   = require('browser-sync').create();


gulp.task('clean', function() {
        return gulp.src('res/')
            .pipe(clean());
});
//Functions
function catchError(e){
    console.log(e.toString());
    this.emit('end');    
}

/**
 * sass task
 */

gulp.task('sass', function(){
        gulp.src('dev/scss/app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS())       
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('res/css/'))
        .pipe(browserSync.reload({stream:true}))
});


gulp.task('jshint', function() {
        return gulp.src('dev/js/**/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
        return gulp.src('dev/js/**/*.js')
            .pipe(uglify())
            .on('error', catchError)
            .pipe(uglify())
            .pipe(concat('main.min.js'))
            .pipe(gulp.dest('res/js/'))
            .pipe(browserSync.stream());
});

/**
 * Imagemin Task
 */

gulp.task('imagemin', function() {
    return gulp.src('dev/img/**/*.{jpg,png,gif}')
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest('res/img/'));
});

//fonts
gulp.task('fonts', function() {
        return gulp.src('dev/fonts/**/*')
            .pipe(gulp.dest('res/fonts'));
});

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: ""
        }
    });
});

//watch
gulp.task('watch', function() {
        gulp.watch('dev/img/**/*.{png,gif,jpg}', ['imagemin'])
        gulp.watch('dev/js/**/*.js', ['uglify'])
        gulp.watch('dev/scss/**/*.scss', ['sass']);
        gulp.watch(['*']).on('change', browserSync.reload);
})
gulp.task('default', function(cb) {
        return runSequence('clean',['jshint', 'uglify', 'sass', 'imagemin', 'fonts', 'watch', 'browser-sync'], cb)
});
