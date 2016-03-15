![go-off__logo](http://i.imgur.com/jU7gG3x.jpg)

# go-off
Front-end Bootstrap System

### Main TODOs:
* Use Laravel/Blade as a template engine for merging html blocks (instead of php native templates)
* Write post-css script to fix less/sass BEM name convention [BEM](https://en.bem.info/)
* Write and install by default jquery-bem library (BEM class manipulation)

### Folders meaning

* build/ - ready-to-use static .html pages
* build/css - css files
* build/js - js files
* build/img - image assets
* build/fonts - font assets
* build/vendor - 3rd party libraries (js/css)
* ---
* src - source file
* src/views/ - php html templates
* src/views/helpers - templates of repeatable helper elements
* src/views/blocks - templates of block elements
* src/views/pages - templates of pages
* src/views/data - data (dummy content) to fill up templates
* src/styles - source style files (less/sass)
* src/styles/helpers - styles of helper blocks
* src/styles/blocks - styles of blocks
* src/scripts - JS script sources (ES6 is available)
* ---
* sys - framework core

### Viewing of built html files
* File build/pagename.html contains built ready-to-use html-markup for the `pagename` page.

### Framework commands
* `sys/grunt-install` - grunt and grunt plugins install
* `sys/serv port` - runs a php built-in web-server on localhost:port (available in WLAN/LAN by your IP)
* `sys/config.php` - configuration file

#### Helper php-scripts (used by grunt-shell)
* html_build.php - simple native-php template engine
* html_fixpaths.php - fixing relative paths in .html, .css, и .js files

### Build
* `grunt` - one-time build
* `grunt online` - continuous build in watch-mode

#### Grunt-plugins
* grunt-contrib-less
* grunt-postcss
* grunt-autoprefixer
* grunt-contrib-cssmin
* grunt-prettify
* grunt-contrib-htmlmin
* grunt-contrib-copy
* grunt-contrib-watch
* grunt-shell
* grunt-babel (es6) _(turned off by default)_
