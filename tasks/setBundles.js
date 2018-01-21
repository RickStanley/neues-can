const glob = require('glob'),
    browserify = require('browserify'),
    watchify = require('watchify')
assign = require('lodash.assign'),
    path = require('path'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream');

module.exports = function (gulp, plugins) {
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

        const b = browserify(opts)
            .external(gulp.opts.src.VENDORS)
            .transform('babelify', {
                presets: ['es2015'],
                plugins: ['transform-remove-strict-mode']
            });
        b.bundle()
            .on('error', gulp.opts.swallowError)
            .pipe(source(path.basename(file, '.js') + '.bundle.js'))
            .pipe(buffer())
            .pipe(plugins.if(!gulp.opts.env.isProduction, plugins.sourcemaps.init()))
            .pipe(plugins.uglify())
            .on('error', gulp.opts.swallowError)
            .pipe(plugins.if(!gulp.opts.env.isProduction, plugins.sourcemaps.write('./')))
            .pipe(gulp.dest(gulp.opts.dest.js));
        bundlers.push({
            b: b,
            fileName: path.basename(file, '.js')
        });
    });
    return bundlers;
};