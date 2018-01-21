const browserSync = require('browser-sync').create();

module.exports = function (gulp, plugins) {
    if (gulp.opts.env.vhost) {
        try {
            // RegExp to test if it is a valid host url
            const regExp = /^((https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
            if (regExp.test(gulp.opts.env.vhost)) {
                var vhostUrl = gulp.opts.env.vhost + (process.env.PWD).substring((process.env.PWD).lastIndexOf('/')) + '/';
            } else {
                setTimeout(function () {
                    throw new Error("Please insert a valid URL to your vhost");
                }, 3000);
            }
        } catch (erro) {
            console.log(`Expected one paremeter: ${erro}`);
        }
    }
    return function () {
        if (typeof vhostUrl === 'undefined' || vhostUrl === '' || vhostUrl === null) {
            browserSync.init({
                server: {
                    baseDir: "./app"
                }
            });
        } else {
            browserSync.init({
                proxy: vhostUrl
            });
        }
    };
};