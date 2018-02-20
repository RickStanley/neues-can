module.exports = function (gulp, plugins, archive) {
    const opts = {
        algorithm: 'sha1',
        hashLength: 40,
        template: '<%= name %><%= ext %>?hash=<%= hash %>'
    };
    return function () {
        let stream = gulp.src(gulp.opts.src.html.pages);
        (gulp.opts.src.html.partials.names).forEach(element => {
            stream = stream.pipe(plugins.inject(gulp.src('src/partials/' + element + '.html'), {
                starttag: '<!-- inject:' + element + ':{{ext}} -->',
                removeTags: true,
                transform: function (filePath, file) {
                    return file.contents.toString('utf8');
                }
            }));
        });
        stream
            .pipe(plugins.inject(gulp.src(['!app/js/vendors.js', 'app/js/*.js', 'app/css/*.css'], {
                read: false
            }).pipe(plugins.if(gulp.opts.env.isProduction, plugins.hash(opts))), {
                ignorePath: 'app'
            }))
            .pipe(plugins.inject(gulp.src('app/js/vendors.js', {
                read: false
            }), {
                name: 'vendors',
                ignorePath: 'app'
            }))
            .pipe(plugins.htmlmin({
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true,
                minifyCSS: true
            }))
            .pipe(gulp.dest(gulp.opts.dest.html));
    };
};