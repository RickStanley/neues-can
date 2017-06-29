//jshint esversion: 6
(function () {
    // Use strict em function form
    'use strict';
    const gulp = require('gulp'),
        jshint = require('gulp-jshint'),
        del = require('del'),
        concat = require('gulp-concat'),
        uglify = require('gulp-uglify'),
        header = require('gulp-header'),
        runSequence = require('run-sequence'),
        imagemin = require('gulp-imagemin'),
        sass = require('gulp-sass'),
        autoprefixer = require('gulp-autoprefixer'),
        cleanCSS = require('gulp-clean-css'),
        rename = require('gulp-rename'),
        browserSync = require('browser-sync').create(),
        babel = require('gulp-babel'),
        chalk = require('chalk');

    // Clears on first run
    gulp.task('clean:res', function () {
        return del([
            'res/**/*'
        ]);
    });

    // Prevents gulp break if catches erro
    let swallowError = function (error) {
        console.log(chalk.red("Position: {").concat(chalk.blue(" line: ".concat(error.loc.line))).concat(chalk.red(",")).concat(chalk.green(" column: ".concat(error.loc.column))).concat(chalk.red(" } \n")).concat(chalk.blue(error.codeFrame)));
        this.emit('end');
    };

    // Sass task
    gulp.task('sass', function () {
        gulp.src('dev/scss/app.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer())
            .pipe(cleanCSS())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('res/css/'))
            .pipe(browserSync.reload({
                stream: true
            }));
    });

    // JSHint
    gulp.task('jshint', function () {
        return gulp.src('dev/js/**/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
    });

    // Minify and Babel, ES5
    gulp.task('uglify', function () {
        return gulp.src('dev/js/**/*.js')
            .pipe(babel({
                presets: ['es2015']
            }))
            .on('error', swallowError)
            .pipe(uglify())
            .pipe(concat('main.min.js'))
            .pipe(gulp.dest('res/js/'))
            .pipe(browserSync.stream());
    });

    // Imagemin Task
    gulp.task('imagemin', function () {
        return gulp.src('dev/img/**/*.{jpg,png,gif}')
            .pipe(imagemin({
                optimizationLevel: 3,
                progressive: true,
                interlaced: true
            }))
            .pipe(gulp.dest('res/img/'));
    });

    // Fonts
    gulp.task('fonts', function () {
        return gulp.src('dev/fonts/**/*')
            .pipe(gulp.dest('res/fonts'));
    });

    // Static server
    gulp.task('browser-sync', function () {
        browserSync.init({
            server: {
                baseDir: ""
            }
        });
    });

    // Watch (out!)
    gulp.task('watch', function () {
        gulp.watch('dev/img/**/*.{png,gif,jpg}', ['imagemin']);
        gulp.watch('dev/js/**/*.js', ['uglify']);
        gulp.watch('dev/scss/**/*.scss', ['sass']);
        gulp.watch(['*']).on('change', browserSync.reload);
    });

    // Default (gulp [no_args])
    gulp.task('default', function (cb) {
        return runSequence('clean:res', ['jshint', 'uglify', 'sass', 'imagemin', 'fonts', 'watch', 'browser-sync'], cb);
    });
}());