module.exports = function (gulp, plugins, archive) {
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
            .pipe(plugins.htmlmin({
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true,
                minifyCSS: true
            }))
            .pipe(gulp.dest(gulp.opts.dest.html));
    };
};