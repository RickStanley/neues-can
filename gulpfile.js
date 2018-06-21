(function () {
    /**
        ## Tasks
        - `default` (or no args): Just build 🏗️
        - `build`: Just build 🏗️
        - `init`: Initialize workspace ⛺
        - `dev`: Opens server (for proxy see general arguments bellow) 👨‍💻
        - `scripts`: Build scripts 📝
        - `vendors`: Build vendors 📜
        - `styles`: Build styles 🎨
        - `injectHtml`: Injects partials, into the html 💉
        - `images`: Minify images 🖼️
        - `watch`: Watch for changes 👀

        #args
        | `--vhost=url` or `--v=url`      | e.g.: `--v=local.dev`, proxy to your virutal host

        If you create a new partial (i.e.: html partial to be included, src/partials/your_partial.html), you must declare its html filename in the html file target.
        <!-- your_partial:html -->
        <!-- endinject -->
        ⚠️ **Important**: When deploying to production/dev, you need to uningnore the `public/` folder in `.gitignore`.
     */
    'use strict';
    const gulp = require('gulp');
    const sass = require('gulp-sass');
    const babel = require('gulp-babel');
    const concat = require('gulp-concat');
    const uglify = require('gulp-uglify');
    const rename = require('gulp-rename');
    const autoprefixer = require('gulp-autoprefixer');
    const imagemin = require('gulp-imagemin');
    const cleanCSS = require('gulp-clean-css');
    const inject = require('gulp-inject');
    const del = require('del');
    const chalk = require('chalk');
    const fs = require('fs'),
        path = require('path');
    const browserSync = require('browser-sync');
    const minimist = require('minimist');
    const sourcemaps = require('gulp-sourcemaps');

    // Minist allows us to be more flexible with arguments
    const args = minimist(process.argv.slice(2));

    const paths = {
        styles: {
            src: 'src/styles/main.scss',
            dest: 'public/styles/'
        },
        scripts: {
            src: ['src/js/**/*.js', '!src/js/vendors/**/*.js'],
            dest: 'public/js/'
        },
        vendors: {
            src: 'src/js/vendors/**/*.js',
            dest: 'public/js/'
        },
        images: {
            src: 'src/img/**/*.{jpg,jpeg,png,svg,gif}',
            dest: 'public/img/'
        },
        html: {
            src: 'src/*.html',
            partials: 'src/partials/',
            dest: 'public/'
        }
    };

    function swallowError(error) {
        try {
            console.log(chalk.red("––––––––––––––––––––––––––––––––– Error ––––––––––––––––––––––––––––––––– \n") +
                chalk.red((error.name) + ": Position {") + chalk.blue(" line: " + (error.loc.line)) + chalk.red(",") + chalk.green(" column: " + (error.loc.column)) + chalk.red(" } \n") +
                chalk.blue(error.codeFrame) + chalk.magenta("\n Path: " + (error.message)) +
                chalk.red(" \n ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––"));
        } catch (err) {
            console.log(chalk.red(error));
        }
    }

    function clean() {
        return del(['public']);
    }

    function styles() {
        return gulp.src(paths.styles.src, {
                sourcemaps: true,
                since: gulp.lastRun(styles)
            })
            .pipe(sass().on('error', sass.logError))
            .pipe(sourcemaps.init())
            .pipe(cleanCSS())
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(rename({
                basename: 'main',
                suffix: '.min'
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.styles.dest));
    }

    function scripts() {
        return gulp.src(paths.scripts.src, {
                sourcemaps: true,
                since: gulp.lastRun(scripts)
            })
            .pipe(babel({
                presets: ['env']
            }))
            .pipe(sourcemaps.init())
            .on('error', swallowError)
            .pipe(uglify())
            .on('error', swallowError)
            .pipe(concat('main.min.js'))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.scripts.dest));
    }

    function vendors() {
        return gulp.src(paths.vendors.src, {
                sourcemaps: true,
                since: gulp.lastRun(scripts)
            })
            .pipe(uglify())
            .on('error', swallowError)
            .pipe(concat('vendors.js'))
            .pipe(gulp.dest(paths.scripts.dest));

    }

    function images() {
        return gulp.src(paths.images.src, {
                since: gulp.lastRun(images)
            })
            .pipe(imagemin([
                imagemin.gifsicle({
                    interlaced: true
                }),
                imagemin.jpegtran({
                    progressive: true
                }),
                imagemin.optipng({
                    optimizationLevel: 3
                }),
                imagemin.svgo({
                    plugins: [{
                        removeViewBox: false
                    }]
                })
            ], {
                verbose: true
            }))
            .pipe(gulp.dest(paths.images.dest));
    }

    function injectHtml() {
        let stream = gulp.src(paths.html.src, {
            since: gulp.lastRun(injectHtml)
        });
        const partials = fs.readdirSync(paths.html.partials);
        partials.forEach(partial => {
            // Removes the ext, we are looking for the name only
            const partial_name = partial.substring(partial.indexOf('.'), -1);
            stream = stream.pipe(inject(gulp.src(paths.html.partials + partial_name + path.extname(partial)), {
                name: partial_name,
                removeTags: true,
                transform: function (filePath, file) {
                    return file.contents.toString('utf-8');
                }
            }));
        });
        return stream.pipe(inject(gulp.src(['!public/js/vendors.js', paths.scripts.dest + '*.js', paths.styles.dest + '*.css'], {
                read: false
            }), {
                addRootSlash: false,
                ignorePath: 'public',
                removeTags: true
            }))
            .pipe(inject(gulp.src(paths.vendors.dest + 'vendors.js', {
                read: false,
                allowEmpty: true
            }), {
                name: 'vendors',
                addRootSlash: false,
                ignorePath: 'public',
                removeTags: true
            }))
            .on('error', swallowError)
            .pipe(gulp.dest(paths.html.dest));
    }

    function server(cb) {
        const virtual_host = args.vhost || args.v;
        const files_watch = [paths.html.dest + '*.html', paths.styles.dest + '**/*.css', paths.scripts.dest + '**/*.js', paths.images.dest + '**/*.{png,gif,jpg,jpeg,svg}'];
        if (virtual_host) {
            browserSync.init({
                files: files_watch,
                proxy: virtual_host,
                injectChanges: true
            })
        } else {
            browserSync.init({
                files: files_watch,
                server: paths.html.dest,
                injectChanges: true
            })
        }
        cb();
    }

    function watch() {
        gulp.watch(paths.scripts.src, scripts);
        gulp.watch(paths.vendors.src, vendors);
        gulp.watch(paths.styles.src, styles);
        gulp.watch(paths.images.src, images);
        gulp.watch(paths.html.src, injectHtml);
    }

    function init() {
        const folders = [
            'src/js',
            'src/js/vendors',
            'src/styles/sections',
            'src/img',
            'public/',
            paths.scripts.dest,
            paths.styles.dest,
            paths.images.dest
        ];
        return Promise.all(folders.map(folder => {
            if (!fs.existsSync(folder)) fs.mkdirSync(folder);
        }));
    }

    /*
     * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
     */
    var build = gulp.series(clean, gulp.parallel(styles, scripts, vendors, images), injectHtml);
    var dev = gulp.series(clean, gulp.parallel(styles, scripts, vendors, images), injectHtml, gulp.parallel(watch, server));

    exports.clean = clean;
    exports.dev = dev;
    exports.scripts = scripts;
    exports.vendors = vendors;
    exports.styles = styles;
    exports.injectHtml = injectHtml;
    exports.images = images;
    exports.watch = watch;
    exports.init = init;
    exports.build = build;

    /*
     * Define default task that can be called by just running `gulp` from cli
     */
    gulp.task('default', build);
}());