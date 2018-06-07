# Neues-Can — Browserify, Gulp, Babel project bootstrap
## Tasks
- `default`: build
- `init`: initializes folders to be used
- `clean`: clear public/ directory, except for public/img
- `html`: partials injection into html, minfication and copy from src/*.html to public/
- `images`: image minification and copy from src/img/* to public/img/
- `bundle`: searchs for entries (src/js/*.js), watch for modifications, bundles (browserify, babelify and minify) and copy from src/js/*.js to public/js/
- `sass`: scss compilation and transformation to css, bundles entries on the high level (src/scss/*.scss) to public/css/
- `dev`: watches for modifications and setup tasks for development
- `vendors`: bundles and unglify all vendors from src/js/vendors/ folder, if the folders doesn't exists, just create it
- `watch`: watches for modifications

### General:
Assets folder should contain essential files like fonts.
You can use ES6 in this project.

If you create a new partial (i.e.: html partial to be included), you must declare its html filename in the html file target. E.g.:
```html
<!-- file: index.html, follow the example bellow -->
<footer>
    <!-- footer:html -->
    <!-- endinject -->
</footer>
```

### About vendors/external libs:
- vendors: all vendors shall be put in src/js/vendors/ folder to be bundled together as one (note: the bundle follows the alphabetic order)
or you can install a package with any package manager and then import them in the script, browserify will resolve the dependencies

## Gulp general arguments
| argument             | Description                                              
|----------------------|----------------------------------------------------------
| `--vhost='url'`      | path.to/vhost/ (e.g.: local.dev) the actual project root is resolved in serve.js
| `-p`                 | declares ENV in production mode
| `dev`            | watches for modifications
| `default` (no args)              | just builds, usage preferred with argv `-p`
| `-s`                 | creates server