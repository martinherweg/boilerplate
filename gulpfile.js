/*------------------------------------*\
    Inhalte

    1. Config
    2. Directories
    3. init Modules
    4. Dev or Production variables
    5. Browser Sync
    6. SCSS
    7. JS
    8. SVG
    9. Images
    10. bower
    11. Building and Watch Tasks
\*------------------------------------*/

// Config

var pkg          = require('./package.json');
var vhost        = 'website.dev';
var destLocation = 'dist';

/*------------------------------------*\
    $directories
\*------------------------------------*/
var targetDirBase = pkg.directory.base;
var targetDirCSS  = pkg.directory.css;
var targetDirJS   = pkg.directory.js;
var targetDirImg  = pkg.directory.img;
var targetDirSVG  = pkg.directory.svg;
var bowerDir      = pkg.directory.bower;

/*------------------------------------*\
    Set the JS Files we want to copy
    from bower_components
\*------------------------------------*/

var bowerComponents = [
];


/*------------------------------------*\
      $init modules
\*------------------------------------*/


var gulp    = require('gulp');
var $       = require('gulp-load-plugins')(),
browserSync = require('browser-sync'),
del         = require('del'),
runSequence = require('run-sequence'),
reload      = browserSync.reload;

var autoprefixer_browsers = [
  'ie >= 9',
  'last 2 version',
];


var on_Error = function(err) {
  $.util.beep();
  console.log(err);
  if (this.emit) {
    this.emit('end');
  };
  return $.notify().write(err);
}



/*------------------------------------*\
  $Browser Sync tasks
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
/$Browser Sync tasks
\*------------------------------------*/


/*------------------------------------*\
  $SASS tasks
\*------------------------------------*/


gulp.task('sass', function() {
  return gulp.src(['assets/scss/style.scss'])
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'nested',
      includePaths: [
        rootLocation + '/scss/**/*.scss'
      ],
      })
      .on('error', $.sass.logError)
      .on('error', $.notify.onError('Sass Compile Error!'))
      )
    .pipe($.autoprefixer({browsers: autoprefixer_browsers}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(destLocation + '/css'))
    .pipe($.filter('**/*.css'))
    .pipe($.notify('Compiled <%= file.relative %>'))
    .pipe($.size({title: 'styles'}))
    .pipe(reload({stream: true}));
});

gulp.task('sass-compressed', function() {
  return gulp.src(['assets/scss/style.scss'])
    .pipe($.plumber({error_handler: on_Error}))
    .pipe($.sass({
      outputStyle: 'compressed',
      includePaths: [
        'assets/scss/**/*.scss'
      ],
    }))
    .pipe($.autoprefixer({browsers: autoprefixer_browsers}))
    .pipe(gulp.dest(destLocation + '/css'))
    .pipe($.notify('Compiled <%= file.relative %>'))
    .pipe($.size({title: 'styles'}));
});

gulp.task('combine-mq', function() {
  return gulp.src(['dist/css/**/*.css'])
    .pipe($.combineMediaQueries({
      log: true
    }))
    .pipe($.debug({verbose: true}))
    .pipe($.minifyCss())
    .pipe($.size({title: 'styles'}))
    .pipe(gulp.dest('dist/css/'))
});

gulp.task('sass-prod', function(cb) {
  runSequence('sass-compressed', 'combine-mq', cb);
});


/*------------------------------------*\
  /$SASS tasks
\*------------------------------------*/

/*------------------------------------*\
  $JS tasks
\*------------------------------------*/

gulp.task('copy-bower-components', function() {
  return gulp.src(bowerComponents)
  .pipe($.newer('assets/js/libs/**/.js'))
  .pipe(gulp.dest('assets/js/libs/'));
});

gulp.task('js-plugins', function() {
  return gulp.src('assets/js/libs/**/*.js')
  .pipe($.plumber({error_handler: on_Error}))
  .pipe($.sourcemaps.init())
  .pipe($.order([
  ]))
  .pipe($.debug({verbose: true}))
  .pipe($.concat('concat/plugins.js'))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('assets/js/'));
});

gulp.task('js-sources', function() {
  return gulp.src('assets/js/my-source/**/*.js')
  .pipe($.plumber({error_handler: on_Error}))
  .pipe($.jshint())
  .pipe($.jshint.reporter('jshint-stylish'))
  .pipe($.sourcemaps.init())
  .pipe($.concat('concat/sources.js'))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('assets/js/'));
});

gulp.task('js-concat', function() {
  return gulp.src('assets/js/concat/**/*.js')
  .pipe($.plumber({error_handler: on_Error}))
  .pipe($.sourcemaps.init({ loadMaps: true }))
  .pipe($.concat('scripts.min.js'))
  .pipe($.uglify())
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest(destLocation + '/js/'))
  .pipe($.size({title: 'JS'}))
  .pipe($.notify('compiled JS'));
});

gulp.task('js', function(cb) {
  runSequence('copy-bower-components', 'clean:concat', 'js-plugins', 'js-sources',  'js-concat', cb);
});


/*------------------------------------*\
/ /$JS tasks
\*------------------------------------*/

/*------------------------------------*\
  $svg tasks
\*------------------------------------*/

gulp.task('svg-single', function() {
  return gulp.src('assets/img/svg/single/**/*')
  .pipe($.plumber({error_handler: on_Error}))
  .pipe($.changed(destLocation + '/img/svg/single/'))
  .pipe($.size({ title: 'svgs before' }))
  .pipe($.imagemin({
    svgoPlugins: [{
      removeViewBox: false
    }]
  }))
  .pipe(gulp.dest(destLocation + '/img/svg/single/'))
  .pipe($.size({ title: 'svgs after'}))
  .pipe(reload({stream: true}));
});

gulp.task('svg-sprite', function() {
  return gulp.src('assets/img/svg/sprite/**/*')
  .pipe($.plumber({error_handler: on_Error}))
  .pipe($.changed(destLocation + '/img/svg/single/'))
  .pipe($.size({ title: 'svg sprite before' }))
  .pipe($.imagemin({
    svgoPlugins: [{
      removeViewBox: false
    }]
  }))
  .pipe($.svgSprite({
    mode: {
      symbol: {
        dest: 'sprite',
        sprite: 'svgsprite.svg',
        inline: true
      }
    }
  }))
  .pipe(gulp.dest(destLocation + '/img/svg/'))
  .pipe($.size({ title: 'svgs after'}))
  .pipe(reload({stream: true}));
});


/*------------------------------------*\
  /$svg tasks
\*------------------------------------*/

/*------------------------------------*\
  $images tasks
\*------------------------------------*/

gulp.task('images', function() {
  return gulp.src(['assets/img/**/*', '!assets/img/svg/**/*'])
  .pipe($.plumber({error_handler: on_Error}))
  .pipe($.changed(destLocation + '/img/'))
  .pipe($.size({ title: 'images before' }))
  .pipe($.imagemin({
    progressive: true,
    interlaces: true
  }))
  .pipe(gulp.dest(destLocation + '/img/'))
  .pipe($.debug({verbose: true}))
  .pipe($.size({ title: 'images' }))
  .pipe(reload({stream: true}));
});


/*------------------------------------*\
  /$images tasks
\*------------------------------------*/


/*------------------------------------*\
    $bower
\*------------------------------------*/

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest(bowerDir))
});

/*------------------------------------*\
    /$bower
\*------------------------------------*/

/*------------------------------------*\
    $version bump
\*------------------------------------*/

gulp.task('bump', function() {
  gulp.src(['bower.json', 'package.json'])
    .pipe(bump({type: 'patch'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump-minor', function() {
  gulp.src(['bower.json', 'package.json'])
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump-major', function() {
  gulp.src(['bower.json', 'package.json'])
    .pipe(bump({type: 'major'}))
    .pipe(gulp.dest('./'));
});

/*------------------------------------*\
    #delete dist
\*------------------------------------*/

gulp.task('clean:dist', function(cb) {
  del([
    destLocation + '/**'
  ],{
      force:true
    }, cb);
});

gulp.task('clean:concat', function(cb) {
  del([
    'assets/js/concat/**/'
  ],{
      force:true
    }, cb);
});


/*------------------------------------*\
    $init and finishing tasks
\*------------------------------------*/

  gulp.task('init', ['bower', 'sass', 'js', 'images', 'svg-single', 'svg-sprite']);


  gulp.task('build', function(cb) {
    runSequence('clean:dist', 'sass', 'js', 'images', 'svg-single', 'svg-sprite', cb);
  });

  gulp.task('publish', function(cb) {
    runSequence('clean:dist', 'bump', 'sass-prod', 'js', 'images', 'svg-single', 'svg-sprite', cb);
  });

  gulp.task('watch', ['browser-sync'], function() {
    gulp.watch('assets/scss/**/*.scss', ['sass']);
    gulp.watch('assets/js/**/*.js', ['js', ['bs-reload']]);
    gulp.watch('**/*.html', ['bs-reload']);
    gulp.watch('**/*.php', ['bs-reload']);
    gulp.watch(['assets/img/cssimg/**/*', 'assets/img/htmlimg/**/*'], ['images']);
    gulp.watch('assets/img/svg/single/**/*', ['svg-single']);
    gulp.watch('assets/img/svg/sprite/**/*', ['svg-sprite']);
  });