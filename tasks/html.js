const gulpIf = require('gulp-if'),
    inject = require('gulp-inject'),
    hash = require('gulp-hash'),
    htmlmin = require('gulp-htmlmin');
module.exports = function (gulp, callback) {
    const opts = {
        algorithm: 'sha1',
        hashLength: 40,
        template: '<%= name %><%= ext %>?hash=<%= hash %>'
    };
    let stream = gulp.src(gulp.opts.src.html.pages);
    (gulp.opts.src.html.partials.names).forEach(partial => {
        stream = stream.pipe(inject(gulp.src('src/partials/' + partial + '.html'), {
            name: partial,
            removeTags: true,
            transform: function (filePath, file) {
                return file.contents.toString('utf8');
            }
        }));
    });
    return stream
        .pipe(inject(gulp.src(['!dist/js/vendors.js', 'dist/js/*.js', 'dist/css/*.css'], {
            read: false
        }).pipe(gulpIf(gulp.opts.env.isProduction, hash(opts))), {
            addRootSlash: false
        }))
        .pipe(inject(gulp.src('dist/js/vendors.js', {
            read: false
        }), {
            name: 'vendors',
            addRootSlash: false
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest(gulp.opts.dest.html));
};