//jshint esversion: 6
(function () {
    // Use strict em function form
    'use strict';
    let isProduction = false;
    // All the necessary modzules for gulp
    const gulp = require('gulp'),
        del = require('del'),
        runSequence = require('run-sequence'),
        chalk = require('chalk'),
        path = require('path'),
        watch = require('gulp-watch'),
        fs = require('fs'),
        assign = require('lodash.assign'),
        plugins = require('gulp-load-plugins')(),
        minimist = require('minimist');

    const argv = minimist(process.argv.slice(2));
    isProduction = (argv.p) ? argv.p : isProduction;

    let watchers = [];

    const options = {
        env: {
            isProduction: isProduction,
            vhost: argv.vhost,
            justbuild: (argv._.indexOf('build') > -1) ? true : false
        },
        dest: {
            html: 'app/',
            images: 'app/img/',
            css: 'app/css/',
            fonts: 'app/fonts/',
            js: 'app/js/',
            root: 'app/'
        },
        src: {
            html: {
                pages: 'src/*.html',
                partials: {
                    path: 'src/partials/*.html',
                    names: ['footer', 'head', 'header']
                }
            },
            images: 'src/img/**/*.{png,gif,jpg,jpeg,svg}',
            css: {
                main: 'src/scss/app.scss',
                includes: 'src/scss/**/*.scss'
            },
            fonts: 'src/fonts/**/*',
            js: 'src/js/**/*.js',
            VENDORS: 'src/js/vendors/**/*.js'
        },
        swallowError: (error) => {
            try {
                console.log(chalk.red("––––––––––––––––––––––––––––––––– Error ––––––––––––––––––––––––––––––––– \n") +
                    chalk.red((error.name) + ": Position {") + chalk.blue(" line: " + (error.loc.line)) + chalk.red(",") + chalk.green(" column: " + (error.loc.column)) + chalk.red(" } \n") +
                    chalk.blue(error.codeFrame) + chalk.magenta("\n Path: " + (error.message)) +
                    chalk.red(" \n ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––"));
            } catch (err) {
                console.log(chalk.red(error));
            } finally {
                console.log("An undefined error has ocurred after trying to bundle JS");
            }
        }
    };

    gulp.opts = assign(options, argv);

    function getTask(task) {
        return require('./tasks/' + task)(gulp, plugins);
    }

    // Clear app
    gulp.task('clean', () => {
        return del([
            'app/**/*'
        ]);
    });

    // Build html
    gulp.task('build-html', getTask('html'));

    // Imagemin Task
    gulp.task('imagemin', getTask('images'));

    // Browserify task, undertaker: build-html task, followed by update (bundle builder) and log        
    gulp.task('browserify', getTask('bundle'));

    // Vendors
    gulp.task('vendors', getTask('vendors'));

    // // Sass task
    gulp.task('sassmin', getTask('scss'));

    // // Fonts
    gulp.task('fonts', getTask('fonts'));

    // Static server
    gulp.task('browser-sync', getTask('serve'));

    // Just build
    gulp.task('build', (cb) => {
        let tasks = [];
        tasks = ['vendors', 'browserify', 'build-html', 'sassmin', 'imagemin', 'fonts'];
        return runSequence('clean', tasks, cb);
    });

    gulp.task('dev', () => {
        watchers.forEach((item, index) => {
            // item.on('change', browserSync.reload);
            item.on('unlink', (file) => {
                const isWind = /^win/.test(process.platform);
                let sId = 0;
                sId = (isWind) ? file.lastIndexOf('src\\') + 4 : file.lastIndexOf('src/') + 4;
                let fileName = path.basename(file),
                    pathToFileApp = file.replace(file.substring(0, sId), (isWind) ? "app\\" : "app/"),
                    pathToFileSrc = file;
                console.log(chalk.yellow(fileName) + chalk.red(" is deleted from /src/. Deleting corresponding file on /app/."));
                del([pathToFileApp])
                    .then((paths) => {
                        console.log(chalk.blue(`Deleted file(s): ${paths.join('\n')}`));
                        // this reads the directory in question and checks if it is empty, if yes then the folder is deleted
                        pathToFileApp = pathToFileApp.substring(pathToFileApp.lastIndexOf((isWind) ? '\\' : '/'), 0);
                        fs.readdir(pathToFileApp, (err, files) => {
                            if (err) throw err;
                            let filesExist = false;
                            return new Promise((resolve, reject) => {
                                for (let key in files) {
                                    if (files.hasOwnProperty(key)) {
                                        if ((path.extname(files[key]) === '') === false) filesExist = true;
                                    }
                                }
                                resolve(filesExist);
                            }).then((exist) => {
                                if (!exist) {
                                    // pathToFileApp = pathToFileApp.substring(0, pathToFileApp.lastIndexOf("/"));
                                    del(pathToFileApp);
                                }
                            }, (reason) => {
                                console.log(`Something went wrong trying to read dir: ${reason}`);
                            });
                        });
                    })
                    .catch((reason) => {
                        console.log(chalk.red(`Something went wrong: ${reason}`));
                    });
            });
        });
    });

    // Default (gulp [no_args])
    gulp.task('default', (cb) => {
        let tasks = [];
        tasks = ['vendors', 'browserify', 'build-html', 'sassmin', 'imagemin', 'fonts', 'browser-sync', 'watch', 'dev'];
        return runSequence('clean', tasks, cb);
    });

    // Watch
    gulp.task('watch', () => {
        watch(options.src.js, {
            ignoreInitial: true
        });
        watchers[0] = watch([options.src.html.pages, options.src.html.partials.path], {
            ignoreInitial: true
        }, getTask('html'));
        watchers[1] = watch(options.src.images, {
            ignoreInitial: true
        }, getTask('images'));
        watchers[2] = watch(options.src.fonts, {
            ignoreInitial: true
        }, getTask('fonts'));
        watch(options.src.css.includes, {
            ignoreInitial: true
        }, getTask('scss'));
    });
}());