//jshint esversion: 6
(function () {
    // Use strict em function form
    'use strict';
    // Vhost argument
    const vArg = process.argv.indexOf("--vhost"),
        iArg = process.argv.indexOf("--imgdel"),
        srcArg = (process.argv.indexOf("--source") > -1) ? true : false,
        strict = (process.argv.indexOf("--strict") > -1) ? '' : ['transform-remove-strict-mode'];
    if (vArg > -1) {
        try {
            // Url validation RegExp
            const regExp = /^((https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
            if (regExp.test(process.argv[vArg + 1])) {
                var vhost = process.argv[vArg + 1] + (process.env.PWD).substring((process.env.PWD).lastIndexOf('/')) + '/';
            } else {
                setTimeout(function () {
                    throw new Error("Please insert a valid URL to your vhost");
                }, 3000);
            }
        } catch (erro) {
            console.log(`Expected one paremeter: ${erro}`);
        }
    }
    const gulp = require('gulp'),
        jshint = require('gulp-jshint'),
        del = require('del'),
        uglify = require('gulp-uglify'),
        runSequence = require('run-sequence'),
        imagemin = require('gulp-imagemin'),
        sass = require('gulp-sass'),
        autoprefixer = require('gulp-autoprefixer'),
        cleanCSS = require('gulp-clean-css'),
        rename = require('gulp-rename'),
        browserSync = require('browser-sync').create(),
        chalk = require('chalk'),
        path = require('path'),
        watch = require('gulp-watch'),
        fs = require('fs'),
        browserify = require('browserify'),
        source = require('vinyl-source-stream'),
        sourcemaps = require('gulp-sourcemaps'),
        gutil = require('gulp-util'),
        buffer = require('vinyl-buffer'),
        watchify = require('watchify'),
        assign = require('lodash.assign'),
        htmlmin = require('gulp-htmlmin'),
        gulpif = require('gulp-if'),
        inject = require('gulp-inject'),
        glob = require('glob'),
        merge = require('merge-stream'),
        cache = require('gulp-cached');

    // gulp.watch(); array container, for listeners
    let watcher = [];
    // Paths to src directories
    const pathsSrc = {
        pages: ['src/*.html', 'src/partials/*.html'],
        images: 'src/img/**/*.{png,gif,jpg}',
        styles: 'src/scss/**/*.scss',
        fonts: 'src/fonts/**/*',
        scripts: 'src/js/**/*.js'
    };

    // Destination paths
    const endPoint = [
        'dist/img/',
        'dist/js/',
        'dist/css/',
        'dist/fonts'
    ];

    // Clears on first run
    gulp.task('clean', () => {
        return del([
            'dist/**/*',
            (iArg > -1) ? '' : '!dist/img/**/*',
            (iArg > -1) ? '' : '!dist/img/',
            (iArg > -1) ? '' : '!dist/img/**',
        ]);
    });

    // JSHint
    gulp.task('jshint', () => {
        return gulp.src('src/js/**/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
    });

    // Copy html(s)
    const moveHtml = () => {
        gulp.src(pathsSrc.pages)
            .pipe(cache('html-cache'))
            .pipe(inject(gulp.src(['src/partials/head.html']), {
                starttag: '<!-- inject:head:{{ext}} -->',
                removeTags: true,
                transform: function (filePath, file) {
                    return file.contents.toString('utf8');
                }
            }))
            .pipe(inject(gulp.src(['src/partials/header.html']), {
                starttag: '<!-- inject:header:{{ext}} -->',
                removeTags: true,
                transform: function (filePath, file) {
                    return file.contents.toString('utf8');
                }
            }))
            .pipe(inject(gulp.src(['src/partials/footer.html']), {
                starttag: '<!-- inject:footer:{{ext}} -->',
                removeTags: true,
                transform: function (filePath, file) {
                    return file.contents.toString('utf8');
                }
            }))
            .pipe(htmlmin({
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true,
                minifyCSS: true
            }))
            .pipe(gulp.dest('dist'))
            .pipe(browserSync.reload({
                stream: true
            }));
    };
    gulp.task('copyHtml', moveHtml);

    // Imagemin Task
    const imgMini = () => {
        gulp.src(pathsSrc.images)
            .pipe(cache('img-cache'))
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
            ], {
                verbose: true
            }))
            .pipe(gulp.dest(endPoint[0]));
    };
    gulp.task('imagemin', imgMini);
    // Browserify task, undertaker: copyHtml task, followed by update (bundle builder) and log
    let swallowError = (error) => {
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
        // this.emit('end');
    };

    function bundle(...args) {
        const file = args[0];
        const files = glob.sync('src/js/*.js');
        if (file && typeof file !== 'function') files.push(file);
        // Custom options for BrowserSync
        return merge(files.map(function (file) {
            const customOptions = {
                basedir: '.',
                debug: true,
                entries: file,
                cache: {},
                packageCache: {}
            };

            const opts = assign({}, watchify.arguments, customOptions);

            const b = watchify(browserify(opts)
                .transform('babelify', {
                    presets: ['es2015'],
                    plugins: strict
                })
            );
            b.on('update', bundle);
            b.on('log', console.log);
            return b.bundle()
                .on('error', swallowError)
                .pipe(source(path.basename(file, '.js') + '.bundle.js'))
                .pipe(buffer())
                .pipe(gulpif(srcArg, sourcemaps.init({
                    loadMaps: true
                })))
                .pipe(uglify())
                .pipe(gulpif(srcArg, sourcemaps.write('./')))
                .pipe(gulp.dest(endPoint[1]))
                .pipe(browserSync.reload({
                    stream: true
                }));
        }));
    }

    gulp.task('browserify', ['copyHtml'], bundle);

    // Sass task
    const cssMini = () => {
        gulp.src('src/scss/app.scss')
            .pipe(cache('css-cache'))        
            .pipe(sass().on('error', sass.logError))
            .pipe(gulpif(srcArg, sourcemaps.init()))
            .pipe(autoprefixer())
            .pipe(cleanCSS())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulpif(srcArg, sourcemaps.write('./')))
            .pipe(gulp.dest(endPoint[2]))
            .pipe(browserSync.reload({
                stream: true
            }));
    };
    gulp.task('sassmin', cssMini);

    // Fonts
    const moveFont = () => {
        gulp.src(endPoint[3])
            .pipe(gulp.dest('dist/fonts'));
    };
    gulp.task('fonts', moveFont);

    // Static server
    // and virtual-host
    gulp.task('browser-sync', () => {
        if (typeof vhost === 'undefined' || vhost === '' || vhost === null) {
            browserSync.init({
                server: {
                    baseDir: "./dist"
                },
                reloadDelay: 1000
            });
        } else {
            browserSync.init({
                proxy: vhost,
                reloadDelay: 1000
            });
        }
    });

    // Watch (out!)
    gulp.task('watch', () => {
        watch(pathsSrc.scripts, {
            ignoreInitial: true
        }).on('change', browserSync.reload);
        watcher[0] = watch(pathsSrc.pages, {
            ignoreInitial: true
        }, moveHtml);
        watcher[1] = watch(pathsSrc.images, {
            ignoreInitial: true
        }, imgMini);
        watcher[2] = watch(pathsSrc.fonts, {
            ignoreInitial: true
        }, moveFont);
        watch(pathsSrc.styles, {
            ignoreInitial: true
        }, cssMini);

        watch('src/js/*.js').on('add', (file) => {
            console.log(`Entry: ${path.basename(file)} added.`);
            bundle(file);
        });

        watcher.forEach((item, index) => {
            item.on('unlink', (file) => {
                const sId = file.lastIndexOf('src/') + 4;
                let fileName = path.basename(file),
                    pathToFileDist = file.replace(file.substring(0, sId), "dist/"),
                    pathToFileDev = file.substring(0, file.lastIndexOf("/"));
                console.log(chalk.yellow(fileName) + chalk.red(" is deleted from /src/. Deleting corresponding file on /dist/."));
                del([pathToFileDist])
                    .then((paths) => {
                        console.log(chalk.blue(`Deleted file(s): ${paths.join('\n')}`));
                    })
                    .catch((reason) => {
                        console.log(chalk.red(`Something went wrong: ${reason}`));
                    });
                    fs.readdir(pathToFileDev, (err, files) => {
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
                                pathToFileDist = pathToFileDist.substring(0, pathToFileDist.lastIndexOf("/"));
                                del(pathToFileDist);
                            }
                        }, (reason) => {
                            console.log(`Something went wrong trying to read dir: ${reason}`);
                        });
                    });
            });
        });
    });

    // Default (gulp [no_args])
    gulp.task('default', (cb) => {
        return runSequence('clean', ['watch', 'browser-sync','browserify', 'jshint', 'sassmin', 'imagemin', 'fonts'], cb);
    });
}());