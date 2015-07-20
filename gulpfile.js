/*------------------------------------*\
    Inhalte

    1. #Config
    2. #Directories
    3. #init Modules
    4. #browserSync
    5. #templates
    6. #sass
\*------------------------------------*/

// Config

var vhost = 'website.dev';
// define if wordpress
var themeName = 'lenaKlagesNew/';


var autoprefixer_browsers = [
  'ie >= 9',
  'last 2 version',
];

/*------------------------------------*\
    $directories
\*------------------------------------*/


var src = 'src/',
    srcAssets = src + 'assets/';
    srcBower = src + 'bower_components/',
    srcTemplates = src + 'templates/'
    srcCss = srcAssets + 'scss/',
    srcJs = srcAssets + 'js/',
    srcJsMySource = srcJs + 'my-source/',
    srcJsJson = srcJs + 'json/',
    srcImages = srcAssets = 'images/',
    srcHtmlImages = srcImages + 'htmlimages/',
    srcCssImages = srcImages + 'cssimages/',
    srcSvg = srcImages + 'svg/',
    srcSvgSingle = srcSvg + 'single/',
    srcSvgSprite = srcSvg + 'sprite/';

if (themeName) {
  var dist = 'dist/wp-content/themes' + themeName;
} else {
  var dist = 'dist/';
}

var distAssets = dist + 'assets/',
    distCss = distAssets + 'css/',
    distJs = distAssets + 'js/',
    distImages = distAssets + 'images/',
    distHtmlImages = distImages + 'htmlimages/',
    distCssImages = distImages + 'cssimages/',
    distSvg = distImages + 'svg/',
    distSvgSingle = distSvg + 'single/',
    distSvgSprite = distSvg + 'sprite/';

/**
 like:
 srcBower + 'package',
 srcJs + 'package'
 etc...
*/
var combineJS = [
  srcJsMySource + '**/*.{js}'
];


/*------------------------------------*\
  #init modules
\*------------------------------------*/


var gulp    = require('gulp');

var $       = require('gulp-load-plugins')(),
browserSync = require('browser-sync'),
del         = require('del'),
runSequence = require('run-sequence'),
reload      = browserSync.reload;


var on_Error = function(err) {
  $.util.beep();
  console.log(err);
  if (this.emit) {
    this.emit('end');
  };
  return $.notify().write(err);
}



/*------------------------------------*\
  #browserSync
\*------------------------------------*/

var browserSyncConfig = {
  proxy: vhost,
  ghostMode: {
    clicks: false,
    forms: true,
    scroll: false
  },
  logLevel: 'info', // info, debug, warn, silent
  watchTask: true,
  open: false, // false if you don't want to automatically open the browser
  stream: true,
  ui: {
    port: 8080
  }
}

gulp.task('browser-sync', function() {
  browserSync(browserSyncConfig);
});

gulp.task('bs-reload', function() {
  browserSync.reload();
});

/*------------------------------------*\
 /#browserSync
\*------------------------------------*/


/*------------------------------------*\
  #templates
\*------------------------------------*/


gulp.task('templates', function() {
  gulp.src(srcTemplates + '**/*.{php,html}')
  .pipe(gulp.dest(dist));
});

/*------------------------------------*\
  #SASS
\*------------------------------------*/


gulp.task('sass', function() {
  gulp.src(srcCss + 'style.scss')
  .pipe($.plumber())
  .pipe($.debug({verbose: true}))
  .pipe($.sass.sync({
    outputStyle: 'compressed',
    precision: 10,
    includePaths: [
      srcCss + '**/*.scss'
    ]
  })
  .on('error', $.sass.logError)
  .on('error', $.notify.onError('Sass Compile Error!'))
)
.pipe($.autoprefixer({
  browsers: autoprefixer_browsers
}))
.pipe($.sourcemaps.write('.'))
.pipe(gulp.dest(distCss))
.pipe($.filter('**/*.css'))
.pipe($.notify('Compiled <% file.relative %>'))
.pipe($.size({
  title: 'styles'
}))
.pipe(reload({
  stream: true
}))
});
