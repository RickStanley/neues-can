//jshint esversion: 6
(function () {
    // !!!!!!!!!!!!! README
    /**
     * # Neues-Can — Browserify, Gulp, Babel project bootstrap
     *  ## Tasks
     *  - `init`: initializes folders to be used
     *  - `clean`: clear public/ directory, except for public/img
     *  - `html`: partials injection into html, minfication and copy from src/*.html to public/
     *  - `images`: image minification and copy from src/img/* to public/img/
     *  - `bundle`: searchs for entries (src/js/*.js), watch for modifications, bundles (browserify, babelify and minify) and copy from src/js/*.js to public/js/
     *  - `sass`: scss compilation and transformation to css, bundles entries on the high level (src/scss/*.scss) to public/css/
     *  - `dev`: watches for modifications and setup tasks for development
     *  - `vendors`: bundles and unglify all vendors from src/js/vendors/ folder, if the folders doesn't exists, just create it
     *  - `watch`: watches for modifications
     *
     *  ### General:
     *  Assets folder should contain essential files like fonts.
     *  You can use ES6 in this project.
     *
     *  If you create a new partial (i.e.: html partial to be included), you must declare its html filename in the html file target. E.g.:
     *  ```html
     *  <!-- file: index.html, follow the example bellow -->
     *  <footer>
     *      <!-- footer:html -->
     *      <!-- endinject -->
     *  </footer>
     *  ```
     *
     *  ### About vendors/external libs:
     *  - vendors: all vendors shall be put in src/js/vendors/ folder to be bundled together as one (note: the bundle follows the alphabetic order)
     *  or you can install a package with any package manager and then import them in the script, browserify will resolve the dependencies
     *
     *  ## Gulp general arguments
     *  | argument             | Description                                              
     *  |----------------------|----------------------------------------------------------
     *  | `--vhost='url'`      | path.to/vhost/ (e.g.: local.dev) the actual project root is resolved in serve.js
     *  | `-p`                 | declares ENV in production mode
     *  | `dev`            | watches for modifications
     *  | `default`              | just builds, usage preferred with argv `-p`
     *  | `-s`                 | creates server
     */
    // !!!!!!!!!!!!! README

    // Use strict em function form
    'use strict';

    let isProduction = false;
    let server = false;

    const isWind = /^win/.test(process.platform);

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
    server = (argv.s) ? true : false;

    let watchers = [];

    const options = {
        env: {
            isProduction: isProduction,
            vhost: argv.vhost,
            justbuild: (argv._.length === 0) ? true : false
        },
        dest: {
            html: 'public/',
            images: 'public/img/',
            css: 'public/css/',
            js: 'public/js/',
            root: 'public'
        },
        src: {
            html: {
                pages: 'src/*.html',
                partials: {
                    glob: 'src/partials/*.html',
                    path: 'src/partials/'
                }
            },
            images: 'src/img/**/*.{png,gif,jpg,jpeg,svg}',
            css: {
                main: 'src/scss/*.scss',
                includes: 'src/scss/**/*.scss'
            },
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

    // Initializes workspace
    gulp.task('init', () => {
        const folders = [
            './src/js',
            './src/js/vendors',
            './src/js/modules',
            './src/scss',
            './src/partials',
            './src/img',
            './' + options.dest.root,
            './' + options.dest.root + '/img',
            './' + options.dest.root + '/js',
            './' + options.dest.root + '/css',
            './assets'
        ];
        return Promise.all(folders.map(async folder => {
            if (!fs.existsSync(folder)) fs.mkdirSync(folder);
        }));
    });

    // Clear public/
    gulp.task('clean', () => {
        return del([
            options.dest.root + '/**/*'
        ]);
    });

    // Build
    gulp.task('default', (cb) => {
        const undertakers = ['images'];
        let tasks = ['clean', 'init', 'vendors', 'bundle', 'scss', 'html'];
        return runSequence(undertakers, ...tasks, cb);
    });

    // Development
    gulp.task('dev', (cb) => {
        const undertakers = ['images'];
        let tasks = ['clean', 'init', 'vendors', 'bundle', 'scss', 'watch-events', 'html'];
        if (server || argv.vhost) tasks.push('serve');
        return runSequence(undertakers, ...tasks, cb);
    });

    // Watch
    gulp.task('watch', (cb) => {
        watch(options.src.js, {
            ignoreInitial: true
        });
        watchers[0] = watch([options.src.html.pages, options.src.html.partials.glob], {
            ignoreInitial: true
        }, batch((events, done) => {
            return runSequence('html', done);
        }));
        watchers[1] = watch(options.src.images, {
            ignoreInitial: true
        }, batch((events, done) => {
            return runSequence('images', done);
        }));
        watch(options.src.css.includes, {
            ignoreInitial: true
        }, batch((events, done) => {
            return runSequence('scss', done);
        }));
        watch(options.src.VENDORS, {
            ignoreInitial: true
        }, batch((events, done) => {
            return runSequence('vendors', done);
        }));
        cb();
    });

    gulp.task('catch-events', (cb) => {
        watchers.forEach((item, index) => {
            item.on('unlink', async (file) => {
                try {
                    let routing = '',
                        isHtml = (file.split('.').pop() === 'html');
                    const srcIndex = (isWind) ? file.lastIndexOf('src\\') + 4 : file.lastIndexOf('src/') + 4;
                    if (isHtml) {
                        routing = __dirname + file.replace(file.substring(0, srcIndex), (isWind) ? "\\" : "/");
                    } else {
                        routing = __dirname + file.replace(file.substring(0, srcIndex), (isWind) ? "\\dist\\" : "/" + options.dest.root + "/");
                    }
                    console.log(chalk.yellow(path.basename(file)) + chalk.red(" is deleted from src/."));
                    await del([routing]);
                    console.log(chalk.blue(`Deleted file: ${path.basename(file)}`));
                    if (!isHtml) {
                        routing = routing.substring(routing.lastIndexOf((isWind) ? '\\' : '/'), 0);
                        if (fs.exists(routing)) {
                            fs.readdir(routing, (err, files) => {
                                if (err) throw err;
                                if (files.length <= 0) del(routing);
                            });
                        }
                    }
                } catch (error) {
                    console.log(chalk.red('Something went wrong: ') + chalk.yellow(error));
                }
            });
        });
        cb();
    });

    gulp.task('watch-events', ['watch'], (cb) => {
        return runSequence('watch', 'catch-events', cb);
    });
}());