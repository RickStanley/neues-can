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
        chalk = require('chalk'),
        path = require('path');

    // Destination paths
    const endPoint = [
        'res/img/',
        'res/js/',
        'res/css/'
    ];

    // gulp.watch(); array container, for listeners
    let watchmen = [];

    // Clears on first run
    gulp.task('clean:res', function () {
        return del([
            'res/**/*'
        ]);
    });

    // Prevents gulp break if catches erro
    let swallowError = function (error) {
        console.log(chalk.red("––––––––––––––––––––––––––––––––– Error ––––––––––––––––––––––––––––––––– \n") +
            chalk.red((error.name) + ": Position {") + chalk.blue(" line: " + (error.loc.line)) + chalk.red(",") + chalk.green(" column: " + (error.loc.column)) + chalk.red(" } \n") +
            chalk.blue(error.codeFrame) + chalk.magenta("\n Path: " + (error.message)) +
            chalk.yellow("\n Plugin: " + (error.plugin)) +
            chalk.red(" \n ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––"));
        this.emit('end');
    };


    // JSHint
    gulp.task('jshint', function () {
        return gulp.src('dev/js/**/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
    });

    // Imagemin Task
    gulp.task('imagemin', function () {
        return gulp.src('dev/img/**/*.{jpg,png,gif}')
            .pipe(imagemin({
                optimizationLevel: 3,
                progressive: true,
                interlaced: true
            }))
            .pipe(gulp.dest(endPoint[0]));
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
            .pipe(gulp.dest(endPoint[1]))
            .pipe(browserSync.stream());
    });

    // Sass task
    gulp.task('sass', function () {
        gulp.src('dev/scss/app.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer())
            .pipe(cleanCSS())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(endPoint[2]))
            .pipe(browserSync.reload({
                stream: true
            }));
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
        watchmen[0] = gulp.watch('dev/img/**/*.{png,gif,jpg}', ['imagemin']);
        watchmen[1] = gulp.watch('dev/js/**/*.js', ['uglify']);
        watchmen[2] = gulp.watch('dev/scss/**/*.scss', ['sass']);
        gulp.watch(['*']).on('change', browserSync.reload);
        watchmen.forEach(function (item, index) {
            item.on('change', function (event) {
                if (event.type === 'deleted') {
                    let fileName = path.basename(event.path);
                    console.log(chalk.yellow(fileName) + chalk.red(" is deleted from /dev/. Deleting corresponding file on /res/."));
                    if (fileName === 'zmaster.js') {
                        fileName = 'main.min.js';
                    }
                    del([endPoint[index] + fileName])
                        .then(function (paths) {
                            console.log(chalk.blue("Deleted file(s): " + paths.join('\n')));
                        })
                        .catch(function (reason) {
                            console.log(chalk.red("Something went wrong: " + reason));
                        });
                }
            });
        });
    });

    // Default (gulp [no_args])
    gulp.task('default', function (cb) {
        return runSequence('clean:res', ['jshint', 'uglify', 'sass', 'imagemin', 'fonts', 'watch', 'browser-sync'], cb);
    });
}());