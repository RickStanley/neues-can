module.exports = function (gulp, plugins) {
    return function () {
        gulp.src(gulp.opts.src.css.main)
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            .pipe(plugins.if(!gulp.opts.env.isProduction, plugins.sourcemaps.init()))
            .pipe(plugins.autoprefixer())
            .pipe(plugins.cleanCss())
            .pipe(plugins.rename({
                suffix: '.min'
            }))
            .pipe(plugins.if(gulp.opts.env.isProduction, plugins.hash()))
            .pipe(plugins.if(!gulp.opts.env.isProduction, plugins.sourcemaps.write('./')))
            .pipe(gulp.dest(gulp.opts.dest.css))
            .pipe(plugins.hash.manifest('app/assests.json', {
                deletOld: true,
                sourceDir: __dirname + '/app/css'
            }));
    };
};