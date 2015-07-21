/*------------------------------------*\
    Inhalte

    1. #Config
    2. #Directories
    3. #init Modules
    4. #browserSync
    5. #templates
    6. #sass
    7. #js
\*------------------------------------*/

// Config

var vhost = 'martin-boilerplate.dev';
// define if wordpress
var themeName = '';


var autoprefixer_browsers = [
  'ie >= 9',
  'last 2 version',
];

/*------------------------------------*\
    $directories
\*------------------------------------*/


var src = 'src/',
    srcAssets = src + 'assets/';
    srcBower = 'bower_components/',
    srcTemplates = srcAssets + 'templates/'
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
  var dist = 'dist/wp-content/themes/' + themeName + '/';
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
var jsSources = {
  // copy Single JS Files which will not be combined
  copyjs: [
    {src: 'src/assets/js/single/**/*'}
  ],

  // Copy and Combine JS Files (Bower and other Plugins)
  combinejs: [
    'bower_components/isotope/dist/isotope.pkgd.js',
    'bower_components/jquery-validate/dist/jquery.validate.js'
  ]
};


// modernizr tests
var modernizrTests = [
  'flexbox',
  'flexboxlegacy'
]

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
  gulp.src(srcTemplates + '**/*.php')
  .pipe($.changed(dist, {
    extension: '.php'
  }))
  .pipe($.debug({verbose: true}))
  .pipe(gulp.dest(dist))
  .pipe($.debug({verbose: true}));
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
  }));
});


/*------------------------------------*\
  #JS tasks
\*------------------------------------*/


// modernizr task

gulp.task('js-modernizr', function() {
  gulp.src([srcCss + '**/*.scss', srcJs + '**/*.js'])
  .pipe($.modernizr({
    crawl: true,
    excludeTests: ['hidden'],
    options: [
      'setClasses',
      'addTest'
    ],
    tests: modernizrTests
  }))
  .pipe($.uglify())
  .pipe($.rename({ suffix: '-custom.min' }))
  .pipe(gulp.dest(distJs + 'vendor/'));
});

// combine bower components and other Plugins
gulp.task('js-plugins', function() {
  gulp.src(jsSources.combinejs)
  .pipe($.plumber())
  .pipe($.debug({
    verbose: true
  }))
  .pipe($.concat('plugins.js'))
  // .pipe($.uglify())
  .pipe(gulp.dest(distJs))
  .pipe($.size({
    title: 'combined JS Plugins'
  }))
  .pipe($.notify('combined JS Plguins'));
});

// move single js or json Files
gulp.task('js-move', function() {
  jsSources.copyjs.forEach(function(item) {
    gulp.src(item.src)
    .pipe($.debug({verbose: true}))
    .pipe($.uglify())
    .pipe(gulp.dest(distJs))
    .pipe($.size({
      title: 'Single JS Files Size:'
    }))
    .pipe($.notify('moved Single JS Files'));
  });
});

// combine my own scripts
gulp.task('js-scripts', function() {
  gulp.src(srcJsMySource + '**/*.js')
  .pipe($.plumber({
    error_handler: on_Error
  }))
  .pipe($.jshint())
  .pipe($.jshint.reporter('jshint-stylish'))
  .pipe($.sourcemaps.init())
  .pipe($.concat('scripts.min.js'))
  .pipe($.uglify())
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest(distJs))
  .pipe($.size({
    title: 'JS'
  }))
  .pipe($.notify('compiled JS'));
});


/*------------------------------------*\
  #JS tasks
\*------------------------------------*/


// init tasks

gulp.task('init', function() {
  runSequence(
    'templates',
    'js-modernizr',
    'sass',
    'js-plugins',
    'js-move',
    'js-scripts'
);
});

//watch task

gulp.task('watch', function() {

  // watch template files
  gulp.watch(srcTemplates + '**/*.php', ['templates']);

  // watch scss files
  gulp.watch(srcCss + '**/*.scss', ['sass']);

  // watch JS Task
  gulp.watch(srcJsMySource + '**/*.js', ['js-scripts']);
  gulp.watch(srcJs + 'single/**/*', ['js-move']);

 // reload task
  gulp.watch(dist + '**/*.{php, html, js, jpg, png, svg}', ['bs-reload']);
});

// default task

gulp.task('default', ['browser-sync', 'watch']);
