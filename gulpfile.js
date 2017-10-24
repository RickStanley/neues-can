//jshint esversion: 6
(function () {
    // Use strict em function form
    'use strict';
    // All the necessary modules for gulp
    const gulp = require('gulp'),
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
        buffer = require('vinyl-buffer'),
        watchify = require('watchify'),
        assign = require('lodash.assign'),
        htmlmin = require('gulp-htmlmin'),
        gulpif = require('gulp-if'),
        inject = require('gulp-inject'),
        glob = require('glob'),
        cache = require('gulp-cached');

    // Possible arguments
    const VHost = process.argv.indexOf("--vhost"),
        deleteImgs = (process.argv.indexOf("--imgdel") > -1) ? true : false,
        sourceMaps = (process.argv.indexOf("--source") > -1) ? true : false,
        strict = (process.argv.indexOf("--strict") > -1) ? '' : ['transform-remove-strict-mode'],
        build = (process.argv.indexOf("build") > -1) ? true : false,
        justBundle = (process.argv.indexOf("--nowatch") > -1) ? true : false;

    // Test if vhost argument has been passed
    if (VHost > -1) {
        try {
            // RegExp to test if it is a valid host url
            const regExp = /^((https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
            if (regExp.test(process.argv[VHost + 1])) {
                var vhostUrl = process.argv[VHost + 1] + (process.env.PWD).substring((process.env.PWD).lastIndexOf('/')) + '/';
            } else {
                setTimeout(function () {
                    throw new Error("Please insert a valid URL to your vhost");
                }, 3000);
            }
        } catch (erro) {
            console.log(`Expected one paremeter: ${erro}`);
        }
    }

    // watch array, for events (listener)
    let watcher = [];

    // Paths to src directories
    const pathsSrc = {
        pages: ['src/*.html', 'src/partials/*.html'],
        images: 'src/img/**/*.{png,gif,jpg,jpeg,svg}',
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

    // swallowError prevents stream break if an error occurs
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
    };

    // Tasks functions

    // Injects partials and src -> dist
    const buildHtml = (archive) => {
        let isPartial = false;
        // Checking if it is a partial to prevent caching
        if (typeof archive.base !== 'undefined' && typeof archive.base !== null) {
            if ((archive.base).substring((archive.base).lastIndexOf('/') + 1) === 'partials') isPartial = true;
        }
        gulp.src(pathsSrc.pages[0])
            .pipe(gulpif(!isPartial, cache('html-cache')))
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

    // Minify images
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

    // Compile to css and minify
    const cssMini = () => {
        gulp.src('src/scss/app.scss')
            .pipe(cache('css-cache'))
            .pipe(sass().on('error', sass.logError))
            .pipe(gulpif(sourceMaps, sourcemaps.init()))
            .pipe(autoprefixer())
            .pipe(cleanCSS())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulpif(sourceMaps, sourcemaps.write('./')))
            .pipe(gulp.dest(endPoint[2]))
            .pipe(browserSync.reload({
                stream: true
            }));
    };

    // Move fonts src -> dist
    const moveFont = () => {
        gulp.src(endPoint[3])
            .pipe(gulp.dest('dist/fonts'));
    };

    var bundler = [];
    // Set javascript entries
    const setBundles = () => {
        const files = glob.sync('src/js/*.js');
        files.map(function (file) {
            const customOptions = {
                basedir: '.',
                debug: true,
                entries: file,
                cache: {},
                packageCache: {}
            };

            const opts = assign({}, watchify.arguments, customOptions);

            const b = (build || justBundle) ? browserify(opts)
                .transform('babelify', {
                    presets: ['es2015'],
                    plugins: strict
                }) :
                watchify(browserify(opts)
                    .transform('babelify', {
                        presets: ['es2015'],
                        plugins: strict
                    })
                );
            bundler.push({
                b: b,
                fileName: path.basename(file, '.js')
            });
            b.on('update', bundle);
            b.on('log', console.log);
        });
    };

    // Building and browseryfying entries
    function bundle() {
        return bundler.forEach(function (element) {
            return (element.b).bundle()
                .on('error', swallowError)
                .pipe(source(element.fileName + '.bundle.js'))
                .pipe(buffer())
                .pipe(gulpif(sourceMaps, sourcemaps.init({
                    loadMaps: true
                })))
                .pipe(uglify())
                .on('error', swallowError)
                .pipe(gulpif(sourceMaps, sourcemaps.write('./')))
                .pipe(gulp.dest(endPoint[1]))
                .pipe(browserSync.reload({
                    stream: true
                }));
        });
    }

    // Clear dist
    gulp.task('clean', () => {
        return del([
            'dist/**/*',
            (deleteImgs) ? '' : '!dist/img/**/*',
            (deleteImgs) ? '' : '!dist/img/',
            (deleteImgs) ? '' : '!dist/img/**',
        ]);
    });

    // Build html
    gulp.task('build-html', buildHtml);

    // Imagemin Task
    gulp.task('imagemin', imgMini);

    // Browserify task, undertaker: build-html task, followed by update (bundle builder) and log        
    gulp.task('browserify', bundle);

    // Sass task
    gulp.task('sassmin', cssMini);

    // Fonts
    gulp.task('fonts', moveFont);

    // Static server
    // and virtual-host
    gulp.task('browser-sync', () => {
        if (typeof vhostUrl === 'undefined' || vhostUrl === '' || vhostUrl === null) {
            browserSync.init({
                server: {
                    baseDir: "./dist"
                },
                reloadDelay: 1000
            });
        } else {
            browserSync.init({
                proxy: vhostUrl,
                reloadDelay: 1000
            });
        }
    });

    // Just build
    gulp.task('build', (cb) => {
        setBundles();
        let tasks = [];
        tasks = ['browserify', 'build-html', 'sassmin', 'imagemin', 'fonts'];
        return runSequence('clean', tasks, cb);
    });

    // Default (gulp [no_args])
    gulp.task('default', (cb) => {
        setBundles();
        let tasks = [];
        tasks = ['browserify', 'build-html', 'sassmin', 'fonts', 'browser-sync', 'watch'];
        if (deleteImgs) tasks.push('imagemin');
        return runSequence('clean', tasks, cb);
    });

    // Watch
    gulp.task('watch', () => {
        watch(pathsSrc.scripts, {
            ignoreInitial: true
        }).on('change', browserSync.reload);
        watcher[0] = watch(pathsSrc.pages, {
            ignoreInitial: true
        }, buildHtml);
        watcher[1] = watch(pathsSrc.images, {
            ignoreInitial: true
        }, imgMini);
        watcher[2] = watch(pathsSrc.fonts, {
            ignoreInitial: true
        }, moveFont);
        watch(pathsSrc.styles, {
            ignoreInitial: true
        }, cssMini);

        // If something is deleted in src, its respective file is deleted in dist
        watcher.forEach((item, index) => {
            item.on('unlink', (file) => {
                const isWind = /^win/.test(process.platform);
                let sId = 0;
                sId = (isWind) ? file.lastIndexOf('src\\') + 4 : file.lastIndexOf('src/') + 4;
                let fileName = path.basename(file),
                    pathToFileDist = file.replace(file.substring(0, sId), (isWind) ? "dist\\" : "dist/"),
                    pathToFileSrc = file;
                console.log(chalk.yellow(fileName) + chalk.red(" is deleted from /src/. Deleting corresponding file on /dist/."));
                del([pathToFileDist])
                    .then((paths) => {
                        console.log(chalk.blue(`Deleted file(s): ${paths.join('\n')}`));
                        // this reads the directory in question and checks if it is empty, if yes then the folder is deleted
                        pathToFileDist = pathToFileDist.substring(pathToFileDist.lastIndexOf((isWind) ? '\\' : '/'), 0);
                        fs.readdir(pathToFileDist, (err, files) => {
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
                                    // pathToFileDist = pathToFileDist.substring(0, pathToFileDist.lastIndexOf("/"));
                                    del(pathToFileDist);
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

        // For future use
        // watch('src/js/*.js').on('add', (file) => {
        //     console.log(`Entry: ${path.basename(file)} added.`);
        //     bundle(file);
        // });
    });
}());