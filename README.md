# Papierkorb 🗑️⚡
Kickstarter simple tasks focused and pure [ES5](https://caniuse.com/#feat=es5).

## Tasks
 - `default` (or no args): Just build 🏗️
 - `build`: Just build 🏗️
 - `init`: Initialize workspace ⛺
 - `dev`: Opens server (for proxy see general arguments bellow) 👨‍💻
 - `scripts`: Build scripts 📝
 - `vendors`: Build vendors 📜
 - `styles`: Build styles 🎨
 - `injectHtml`: Injects partials, into the html 💉
 - `images`: Minify images 🖼️
 - `watch`: Watch for changes 👀

 ⚠️ **Important**: When deploying to production/dev, you need to uningnore the `public/` folder in `.gitignore`.

### General arguments
| argument             | Description                                              
|----------------------|----------------------------------------------------------
| `--vhost=url` or `--v=url`      | e.g.: `--v=local.dev`, proxy to your virtual host

### About vendors/external libs
 - vendors: all vendors shall be put in `src/js/vendors/` folder to be bundled together as one (note: the bundle follows the alphabetic order)

### About partials
If you create a new partial (i.e.: html partial to be included, `src/partials/your_partial.html`), you must declare its html filename in the html file target. E.g.:
```html
<!-- file: index.html, follow the example bellow -->
<footer>
    <!-- your_partial:html -->
    <!-- endinject -->
</footer>
    <!-- another_partial:html -->
    <!-- endinject -->
```
Pre-defined partials are: `footer.html`, `head.html` and `header.html`
### Folder init structure
 ```
 root
├── public
|   ├── js/
|   |   ├── main.min.js
|   |   └── main.min.js.map
|   ├── styles/
|   |   ├── main.min.css
|   |   └── main.min.css.map
│   └── *.html  
└── src
    ├── img/*.{svg,jpeg,jpg,png,gif}
    ├── js/
    |   ├── vendors/
    |   └── *.js
    ├── partials/*.html
    ├── styles/
    |   ├── sections/
    |   ├── utils/
    |   |   ├── _common.scss
    |   |   ├── _functions.scss
    |   |   ├── _text.scss
    |   |   ├── _variables.scss
    |   |   └── index.scss
    |   └── main.scss
    └── *.html
 ```