const gulpIf = require('gulp-if'),
    inject = require('gulp-inject'),
    hash = require('gulp-hash'),
    htmlmin = require('gulp-htmlmin'),
    fs = require('fs');
module.exports = function (gulp, callback) {
    const opts = {
        algorithm: 'sha1',
        hashLength: 40,
        template: '<%= name %><%= ext %>?hash=<%= hash %>'
    };
    let stream = gulp.src(gulp.opts.src.html.pages);
    const partials = fs.readdirSync(gulp.opts.src.html.partials.path);
    partials.forEach(partial => {
        partial = partial.substring(partial.indexOf('.'), -1);
        stream = stream.pipe(inject(gulp.src('src/partials/' + partial + '.html'), {
            name: partial,
            removeTags: true,
            transform: function (filePath, file) {
                return file.contents.toString('utf8');
            }
        }));
    });
    return stream
        // This is for inline css
        // .pipe(inject(gulp.src(gulp.opts.dest.root+'/css/*.css'), {
        //     removeTags: true,
        //     transform: function (filePath, file) {
        //         return `<style>${file.contents.toString('utf8')}</style>`;
        //     }
        // }))
        .pipe(inject(gulp.src(['!' + gulp.opts.dest.root + '/js/vendors.js', gulp.opts.dest.root + '/js/*.js', gulp.opts.dest.root + '/css/*.css'], {
            read: false
        }).pipe(gulpIf(gulp.opts.env.isProduction, hash(opts))), {
            addRootSlash: false,
            ignorePath: gulp.opts.dest.root
        }))
        .pipe(inject(gulp.src(gulp.opts.dest.root + '/js/vendors.js', {
            read: false
        }), {
            name: 'vendors',
            addRootSlash: false,
            ignorePath: gulp.opts.dest.root
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest(gulp.opts.dest.html));
};