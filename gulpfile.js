//jshint esversion: 6
(function () {
    // Use strict em function form
    'use strict';
    // Vhost argument
    const vArg = process.argv.indexOf("--vhost"),
        iArg = process.argv.indexOf("--imgdel");
    if (vArg > -1) {
        try {
            // Url validation RegExp
            const regExp = /^((https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
            if (regExp.test(process.argv[vArg + 1])) {
                var vhost = process.argv[vArg + 1];
            } else {
                setTimeout(function () {
                    console.log("Please insert a valid URL to your vhost");
                }, 3000);
            }
        } catch (erro) {
            console.log("Expected one paremeter: " + erro);
        }
    }
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
        path = require('path'),
        watch = require('gulp-watch'),
        fs = require('fs');

    // Destination paths
    const endPoint = [
        'dist/img/',
        'dist/js/',
        'dist/css/'
    ];

    // gulp.watch(); array container, for listeners
    let watcher = [];

    // Clears on first run
    gulp.task('clean:dist',() => {
        return del([
            'dist/**/*',
            (iArg > -1) ? '' : '!dis/img/**/*',
            (iArg > -1) ? '' : '!dist/img/',
            (iArg > -1) ? '' : '!dist/img/**'
        ]);
    });

    // Prevents gulp break if catches erro
    let swallowError = (error) => {
        console.log(chalk.red("––––––––––––––––––––––––––––––––– Error ––––––––––––––––––––––––––––––––– \n") +
            chalk.red((error.name) + ": Position {") + chalk.blue(" line: " + (error.loc.line)) + chalk.red(",") + chalk.green(" column: " + (error.loc.column)) + chalk.red(" } \n") +
            chalk.blue(error.codeFrame) + chalk.magenta("\n Path: " + (error.message)) +
            chalk.yellow("\n Plugin: " + (error.plugin)) +
            chalk.red(" \n ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––"));
        this.emit('end');
    };


    // JSHint
    gulp.task('jshint', () => {
        return gulp.src('dev/js/**/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
    });

    // Imagemin Task
    gulp.task('imagemin', () => {
        watcher[0] = watch('dev/img/**/*.{png,gif,jpg}', {
            ignoreInitial: false
        }, () => {
            gulp.src('dev/img/**/*.{jpg,png,gif}')
                .pipe(imagemin([
                    imagemin.gifsicle({
                        interlaced: true
                    }),
                    imagemin.jpegtran({
                        progressive: true
                    }),
                    imagemin.optipng({
                        optimizationLevel: 5
                    }),
                    imagemin.svgo({
                        plugins: [{
                            removeViewBox: true
                        }]
                    })
                ]))
                .pipe(gulp.dest(endPoint[0]));
        });
    });

    // Minify and Babel, ES5
    gulp.task('uglify', () => {
        watcher[1] = watch('dev/js/**/*.js', {
            ignoreInitial: false
        }, () => {
            gulp.src('dev/js/**/*.js')
                .pipe(babel({
                    presets: ['es2015']
                }))
                .on('error', swallowError)
                .pipe(uglify())
                .pipe(concat('main.min.js'))
                .pipe(gulp.dest(endPoint[1]))
                .pipe(browserSync.stream());
        });
    });

    // Sass task
    gulp.task('sass', () => {
        watcher[2] = watch('dev/scss/**/*.scss', {
            ignoreInitial: false
        }, () => {
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
    });

    // Fonts
    gulp.task('fonts', () => {
        return gulp.src('dev/fonts/**/*')
            .pipe(gulp.dest('dist/fonts'));
    });

    // Static server
    // and virtual-host
    gulp.task('browser-sync', () => {
        if (typeof vhost === 'undefined' || vhost === '' || vhost === null) {
            browserSync.init({
                server: {
                    baseDir: ""
                },
                reloadDebounce: 2000
            });
        } else {
            browserSync.init({
                proxy: vhost,
                reloadDelay: 2000
            });
        }
    });

    // Watch (out!)
    gulp.task('watch',() => {
        watch(['*'], {
            ignoreInitial: false
        }).on('change', browserSync.reload);
        watcher.forEach((item, index) => {
            item.on('unlink',(file) => {
                const sId = file.lastIndexOf('dev/') + 4;
                let fileName = path.basename(file),
                    pathToFileDist = file.replace(file.substring(0, sId), "dist/"),
                    pathToFileDev = file.substring(0, file.lastIndexOf("/"));
                console.log(chalk.yellow(fileName) + chalk.red(" is deleted from /dev/. Deleting corresponding file on /dist/."));
                if (fileName === 'zmaster.js') {
                    fileName = 'main.min.js';
                }
                del([pathToFileDist])
                    .then((paths) => {
                        console.log(chalk.blue("Deleted file(s): " + paths.join('\n')));
                    })
                    .catch((reason) => {
                        console.log(chalk.red("Something went wrong: " + reason));
                    });
                fs.readdir(pathToFileDev, (err, files) => {
                    if (err) throw err;
                    let filesExist = false;
                    for (let key in files) {
                        if (files.hasOwnProperty(key)) {
                            if ((path.extname(files[key]) === '') === false) filesExist = true;
                        }
                    }
                    if (!filesExist) {
                        pathToFileDist = pathToFileDist.substring(0, pathToFileDist.lastIndexOf("/"));
                        del([pathToFileDev, pathToFileDist]);
                    }
                });
            });
        });
    });

    // Default (gulp [no_args])
    gulp.task('default', (cb) => {
        return runSequence('clean:dist', ['jshint', 'uglify', 'sass', 'imagemin', 'fonts', 'watch', 'browser-sync'], cb);
    });
}());