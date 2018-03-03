//jshint esversion: 6
(function () {
    // !!!!!!!!!!!!! README
    /**
     *   ## Tasks
     *   - clean: clear dist/ directory, except for dist/img
     *   - html: partials injection into html, minfication and copy from src/*.html to dist/
     *   - images: image minification and copy from src/img/* to dist/img/
     *   - bundle: searchs for entries (src/js/*.js), watch for modifications, bundles (browserify, babelify and minify) and copy from src/js/{entries}.js to dist/js/
     *   - sass: scss compilation and transformation to css, copy from src/sass/app.scss (main) to dist/css/
     *   - fonts: copy from src/fonts to dist/fonts/
     *   - dev: watches for deleted files and unlink them in their corresponding path in dist/
     *   - vendors: bundles and unglify all vendors from src/js/vendors/ folder, if the folders doesn't exists, just create it
     * 
     *   ## General:
     *   You can use ES6 in this project.
     * 
     *   ## About partials:
     *   If you create a new partial, you must declare its html filename in the partials array of names bellow
     * 
     *   ## About vendors/external libs:
     *   - vendors: all vendors shall be put in src/js/vendors/ folder to be bundled together as one (note: the bundle follows the alphabetic order)
     * 
     *   ## Gulp general arguments
     *   | argument           | Description                                              
     *   |--------------------|----------------------------------------------------------
     *   | --vhost="{vhost}"  | path/to/vhost/and/project-index (e.g.: local.dev/project)
     *   | -p                 | declares ENV in production mode, usage preferred with task `build` like so: `gulp build -p`
     *   | default            | watches for modifications and serve
     *   | build              | just builds, usage preferred with argv `-p` like so: `gulp build -p`
     */
    // !!!!!!!!!!!!! REDME

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
        minimist = require('minimist'),
        gulpRequireTasks = require('gulp-require-tasks'),
        batch = require('gulp-batch');

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
            html: './',
            images: 'dist/img/',
            css: 'dist/css/',
            fonts: 'dist/fonts/',
            js: 'dist/js/',
            root: '/'
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
            }
        }
    };

    gulp.opts = assign(options, argv);

    // This requires the tasks within the tasks/ folder, it uses it's own filename as task name (e.g.: bundle.js, taskname: bundle)
    gulpRequireTasks({
        path: __dirname + '/tasks',
        gulp: gulp
    });

    // Clear dist
    gulp.task('clean', () => {
        return del([
            'dist/**/*'
        ]);
    });

    // Just build
    gulp.task('build', (cb) => {
        return runSequence('clean', 'vendors', 'bundle', 'scss', 'images', 'fonts', 'html', cb);
    });

    // Default (gulp [no_args])
    gulp.task('default', (cb) => {
        return runSequence('clean', 'vendors', 'bundle', 'scss', 'images', 'fonts', 'serve', 'watch', 'dev', 'html', cb);
    });

    // Watch
    gulp.task('watch', (cb) => {
        watch(options.src.js, {
            ignoreInitial: true
        });
        watchers[0] = watch([options.src.html.pages, options.src.html.partials.path], {
            ignoreInitial: true
        }, batch((events, done) => {
            return runSequence('html', done);
        }));
        watchers[1] = watch(options.src.images, {
            ignoreInitial: true
        }, batch((events, done) => {
            return runSequence('images', done);
        }));
        watchers[2] = watch(options.src.fonts, {
            ignoreInitial: true
        }, batch((events, done) => {
            return runSequence('fonts', done);
        }));
        watch(options.src.css.includes, {
            ignoreInitial: true
        }, batch((events, done) => {
            return runSequence('scss', done);
        }));
        cb();
    });

    gulp.task('dev', (cb) => {
        watchers.forEach((item, index) => {
            item.on('unlink', (file) => {
                const isWind = /^win/.test(process.platform);
                let sId = 0;
                sId = (isWind) ? file.lastIndexOf('src\\') + 4 : file.lastIndexOf('src/') + 4;
                let fileName = path.basename(file),
                    pathToFileApp = file.replace(file.substring(0, sId), (isWind) ? "dist\\" : "dist/"),
                    pathToFileSrc = file;
                console.log(chalk.yellow(fileName) + chalk.red(" is deleted from /src/. Deleting corresponding file on /dist/."));
                del([pathToFileApp])
                    .then((paths) => {
                        console.log(chalk.blue(`Deleted file(s): ${paths.join('\n')}`));
                        // this reads the directory in question and checks if it is empty, if yes then the folder is deleted
                        pathToFileApp = pathToFileApp.substring(pathToFileApp.lastIndexOf((isWind) ? '\\' : '/'), 0);
                        fs.readdir(pathToFileApp, (err, files) => {
                            if (err) throw err;
                            let filesExist = false;
                            let promise = new Promise((resolve, reject) => {
                                for (let key in files) {
                                    if (files.hasOwnProperty(key)) {
                                        if ((path.extname(files[key]) === '') === false) filesExist = true;
                                    }
                                }
                                resolve(filesExist);
                            });
                            promise
                            .then((exist) => {
                                if (!exist) {
                                    del(pathToFileApp);
                                }
                            }).catch((reason) => {
                                console.log(`Something went wrong trying to read dir: ${reason}`);
                            });
                        });
                    })
                    .catch((reason) => {
                        console.log(chalk.red(`Something went wrong: ${reason}`));
                    });
            });
        });
        cb();
    });
}());