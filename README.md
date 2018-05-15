# Sassy-can — A Browserify, Gulp, Babel, and ES6 free project bootstrap
The title says it all.
## Tasks
- clean: clear dist/ directory, except for dist/img
- html: partials injection into html, minfication and copy from src/*.html to dist/
- images: image minification and copy from src/img/* to dist/img/
- bundle: searchs for entries (src/js/*.js), watch for modifications, bundles (browserify, babelify and minify) and copy from src/js/{entries}.js to dist/js/
- sass: scss compilation and transformation to css, copy from src/sass/app.scss (main) to dist/css/
- dev: watches for deleted files and unlink them in their corresponding path in dist/
- vendors: bundles and unglify all vendors from src/js/vendors/ folder, if the folders doesn't exists, just create it

## General:
You can use ES6 in this project.

## About partials:
If you create a new partial, you must declare its html filename in the partials array of names bellow

## About vendors/external libs:
- vendors: all vendors shall be put in src/js/vendors/ folder to be bundled together as one (note: the bundle follows the alphabetic order)
or you can install a package with any package manager and then import them in the script, browserify will resolve the dependencies

## Gulp general arguments
| argument           | Description                                              
|--------------------|----------------------------------------------------------
| --vhost="{vhost}"  | path.to/vhost/ (e.g.: local.dev) the actual project root is resolved in serve.js
| -p                 | declares ENV in production mode, usage preferred with task `build` like so: `gulp build -p`
| default            | watches for modifications
| build              | just builds, usage preferred with argv `-p` like so: `gulp build -p`
| -s                 | creates server