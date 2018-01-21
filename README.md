# Sassy-can — A Browserify, Gulp, Babel, and ES6 free project bootstrap
The title says it all.
## Getting started
Download `devDependencies`
```
npm i -g yarn
yarn
```
Install gulp globally and start it
```
npm i -g gulp
gulp
```
## Tasks
- **clean**: clear app/ directory, except for app/img
- **build-html**: partials injection into html, minfication and copy from src/*.html to app/
- **imagemin**: image minification and copy from src/img/* to app/img/
- **browserify**: searchs for entries (src/js/*.js), watch for modifications, bundles (browserify, babelify and minify) and copy from src/js/{entries}.js to app/js/
- **sassmin**: scss compilation and transformation to css, copy from src/sass/app.scss (main) to app/css/
- **fonts**: copy from src/fonts to app/fonts/

## Gulp arguments
| argument      | Description                                              
|----------|----------------------------------------------------------
| --vhost="{vhost}"  | path/to/vhost/and/project-index (e.g.: local.dev/project)
| -p | bundles in production mode
| default | watches for modifications and serve
| build | just builds, usage preferred with argv `-p` like so: `gulp build -p`