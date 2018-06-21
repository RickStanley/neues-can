# Papierkorb 🗑️ ️
Kickstarter simple tasks-focused and pure [ES5](https://caniuse.com/#feat=es5).

## Tasks
 - `build`: Just build
 - `init`: Initialize workspace
 - `dev`: Opens server
 - `scripts`: Builds scripts
 - `vendors`: Builds vendors
 - `styles`: Builds styles
 - `injectHtml`: Injects partials, into the html
 - `images`: Minify images
 - `watch`: Watch for changes

### General arguments
| argument             | Description                                              
|----------------------|----------------------------------------------------------
| `--vhost=url` or `--v=url`      | e.g.: `--v=local.dev`, proxy to your virutal host
### General:
If you create a new partial (i.e.: html partial to be included, src/partials/your_partial.html), you must declare its html filename in the html file target. E.g.:
```html
<!-- file: index.html, follow the example bellow -->
<footer>
    <!-- your_partial:html -->
    <!-- endinject -->
</footer>
```

### About vendors/external libs:
 - vendors: all vendors shall be put in src/js/vendors/ folder to be bundled together as one (note: the bundle follows the alphabetic order)
or you can install a package with any package manager and then import them in the script, browserify will resolve the dependencies
