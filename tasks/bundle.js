const buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify'),
    glob = require('glob'),
    browserify = require('browserify'),
    assign = require('lodash.assign'),
    path = require('path'),
    hash = require('gulp-hash'),
    gulpIf = require('gulp-if'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    merge2 = require('merge2');

function setBundles(gulp) {
    const files = glob.sync('src/js/*.js');
    var bundlers = [];
    files.map(function (file) {
        const customOptions = {
            basedir: '.',
            debug: true,
            entries: [file],
            cache: {},
            packageCache: {}
        };

        const opts = assign({}, watchify.arguments, customOptions);

        let b = (!gulp.opts.env.justbuild) ? browserify(opts)
            .external(gulp.opts.src.VENDORS)
            .transform('babelify', {
                presets: ['env'],
                plugins: ['transform-remove-strict-mode']
            }) : browserify(opts)
            .external(gulp.opts.src.VENDORS)
            .transform('babelify', {
                presets: ['env'],
                plugins: ['transform-remove-strict-mode']
            }).bundle()
            .on('error', gulp.opts.swallowError)
            .pipe(source(path.basename(file, '.js') + '.bundle.js'))
            .pipe(buffer())
            .pipe(gulpIf(gulp.opts.env.isProduction, hash()))
            .pipe(gulpIf(!gulp.opts.env.isProduction, sourcemaps.init()))
            .pipe(uglify())
            .on('error', gulp.opts.swallowError)
            .pipe(gulpIf(!gulp.opts.env.isProduction, sourcemaps.write('./')))
            .pipe(gulp.dest(gulp.opts.dest.js))
            .pipe(hash.manifest('public/assets.json', {
                deletOld: true,
                sourceDir: __dirname + '/public/js'
            }))
            .pipe(gulp.dest('.'));
        b.on('log', console.log);
        bundlers.push({
            b: b,
            fileName: path.basename(file, '.js')
        });
    });
    return bundlers;
}

module.exports = function (gulp, callback) {
    let bundlers = setBundles(gulp);
    let streams = [];
    if (!gulp.opts.env.justbuild) {
        bundlers.forEach(element => {
            watchify(element.b)
                .on('update', function () {
                    (element.b).bundle()
                        .on('error', gulp.opts.swallowError)
                        .pipe(source(element.fileName + '.bundle.js'))
                        .pipe(buffer())
                        .pipe(gulpIf(gulp.opts.env.isProduction, hash()))
                        .pipe(gulpIf(!gulp.opts.env.isProduction, sourcemaps.init()))
                        .pipe(uglify())
                        .on('error', gulp.opts.swallowError)
                        .pipe(gulpIf(!gulp.opts.env.isProduction, sourcemaps.write('./')))
                        .pipe(gulp.dest(gulp.opts.dest.js))
                        .pipe(hash.manifest('public/assets.json', {
                            deletOld: true,
                            sourceDir: __dirname + '/public/js'
                        }))
                        .pipe(gulp.dest('.'));
                });
            let bundle = (element.b).bundle()
                .on('error', gulp.opts.swallowError)
                .pipe(source(path.basename(element.fileName, '.js') + '.bundle.js'))
                .pipe(buffer())
                .pipe(gulpIf(gulp.opts.env.isProduction, hash()))
                .pipe(gulpIf(!gulp.opts.env.isProduction, sourcemaps.init()))
                .pipe(uglify())
                .on('error', gulp.opts.swallowError)
                .pipe(gulpIf(!gulp.opts.env.isProduction, sourcemaps.write('./')))
                .pipe(gulp.dest(gulp.opts.dest.js))
                .pipe(hash.manifest('public/assets.json', {
                    deletOld: true,
                    sourceDir: __dirname + '/public/js'
                }))
                .pipe(gulp.dest('.'));
            streams.push(bundle);
        });
    } else {
        (bundlers).forEach(element => {
            streams.push(element.b);
        });
    }
    return merge2(streams);
};