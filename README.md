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
- **clean**: clear dist/ directory, except for dist/img (you can use the `--imgdel` argument to clear this one too)
- **build-html**: partials injection into html, minfication and copy from src/*.html to dist/
- **imagemin**: image minification and copy from src/img/* to dist/img/
- **browserify**: searchs for entries (src/js/*.js), watch for modifications, bundles (browserify, babelify and minify) and copy from src/js/{entries}.js to dist/js/
- **sassmin**: scss compilation and transformation to css, copy from src/sass/app.scss (main) to dist/css/
- **fonts**: copy from src/fonts to dist/fonts/

## Gulp arguments
| argument      | Description                                              
|----------|----------------------------------------------------------
| --vhost  | path/to/vhost/and/project-index (e.g.: local.dev/project)                  
| --imgdel | Delete images in dist/img executing gulp                 
| --source | If explicit, maps for JS and SCSS (or CSS) are generated 
| --strict | If explicit, 'use strict' is included in bundle.js       