/**
    ## Tasks
    - `default` (or no args): Just build 🏗️
    - `build`: Just build 🏗️
    - `init`: Initialize workspace ⛺
    - `dev`: Opens server (for proxy see general arguments bellow) 👨‍💻
    - `scripts`: Build scripts 📝
    - `vendors`: Build vendors 📜
    - `styles`: Build styles 🎨
    - `html`: Injects partials, scripts and styles into the html 💉
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
const gulp = require('gulp'),
    sass = require('gulp-sass'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    cleanCSS = require('gulp-clean-css'),
    inject = require('gulp-inject'),
    del = require('del'),
    chalk = require('chalk'),
    fs = require('fs'),
    path = require('path'),
    browserSync = require('browser-sync'),
    minimist = require('minimist'),
    sourcemaps = require('gulp-sourcemaps'),
    htmlmin = require('gulp-htmlmin'),
    glob = require('glob');

// Minist allows us to be more flexible with arguments
const args = minimist(process.argv.slice(2));

const paths = {
    styles: {
        dir: 'src/styles/',
        src: 'src/styles/*.scss',
        includes: 'src/styles/**/*.scss',
        dest: 'public/styles/'
    },
    scripts: {
        src: 'src/js/*.js',
        dir: 'src/js/',
        dest: 'public/js/'
    },
    vendors: {
        src: 'src/js/vendors/**/*.js',
        dir: 'src/js/vendors/',
        dest: 'public/js/'
    },
    images: {
        src: 'src/img/**/*.{jpg,jpeg,png,svg,gif}',
        dir: 'src/img/',
        dest: 'public/img/'
    },
    html: {
        src: 'src/*.html',
        partials: 'src/partials/*.html',
        partialsDir: 'src/partials/',
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
    return gulp.src(paths.styles.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(cleanCSS())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
    return gulp.src(paths.scripts.src, {
            sourcemaps: true
        })
        .pipe(babel())
        .pipe(sourcemaps.init())
        .on('error', swallowError)
        .pipe(uglify())
        .on('error', swallowError)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.scripts.dest));
}

function vendors() {
    return gulp.src(paths.vendors.src, {
            sourcemaps: true,
            since: gulp.lastRun(vendors)
        })
        .pipe(uglify())
        .on('error', swallowError)
        .pipe(rename({
            basename: 'vendors'
        }))
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

function html() {
    let stream = gulp.src(paths.html.src);
    const [partials, scripts, styles] = [glob.sync(paths.html.partials), glob.sync(paths.scripts.src), glob.sync(paths.styles.src)];
    for (const partial of partials) {
        // Removes the ext, we are looking for the name only
        const partialName = path.basename(partial, '.html');
        stream = stream.pipe(inject(gulp.src(paths.html.partialsDir + partialName + '.html'), {
            name: partialName,
            removeTags: true,
            transform: function (filePath, file) {
                return file.contents.toString('utf-8');
            }
        }));
    }
    for (const script of scripts) {
        const scriptName = path.basename(script, '.js');
        stream = stream.pipe(inject(gulp.src(paths.scripts.dest + scriptName + '.min.js', {
            read: false,
            allowEmpty: true
        }), {
            name: scriptName,
            addRootSlash: false,
            ignorePath: 'public',
            removeTags: true
        }));
    }
    for (const style of styles) {
        const styleName = path.basename(style, '.scss');
        stream = stream.pipe(inject(gulp.src(paths.styles.dest + styleName + '.min.css', {
            read: false,
            allowEmpty: true
        }), {
            name: styleName,
            addRootSlash: false,
            ignorePath: 'public',
            removeTags: true
        }));
    }
    return stream.pipe(htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            removeComments: true
        }))
        .on('error', swallowError)
        .pipe(gulp.dest(paths.html.dest));
}

function server(cb) {
    const virtualHost = args.vhost || args.v;
    const filesWatch = [paths.html.dest + '*.html', paths.styles.dest + '**/*.css', paths.scripts.dest + '**/*.js', paths.images.dest + '**/*.{png,gif,jpg,jpeg,svg}'];
    if (virtualHost) {
        browserSync.init({
            files: filesWatch,
            proxy: virtualHost,
            injectChanges: true
        })
    } else {
        browserSync.init({
            files: filesWatch,
            server: paths.html.dest,
            injectChanges: true
        })
    }
    cb();
}

function watch(cb) {
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.vendors.src, vendors);
    gulp.watch(paths.styles.includes, styles);
    gulp.watch(paths.images.src, images);
    gulp.watch([paths.html.src, paths.html.partials], html);
    cb();
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
var build = gulp.series(clean, gulp.parallel(styles, scripts, vendors, images), html);
var dev = gulp.series(clean, gulp.parallel(styles, scripts, vendors, images), html, gulp.parallel(watch, server));

exports.clean = clean;
exports.dev = dev;
exports.scripts = scripts;
exports.vendors = vendors;
exports.styles = styles;
exports.html = html;
exports.images = images;
exports.watch = watch;
exports.init = init;
exports.build = build;

/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task('default', build);