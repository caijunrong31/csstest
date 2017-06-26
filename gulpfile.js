var gulp = require('gulp'),
    fileinclude = require('gulp-file-include'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    autoprefixer = require('gulp-autoprefixer'),
    cache = require('gulp-cache'),
    imagemin = require('gulp-imagemin'),
    sourcemaps = require('gulp-sourcemaps');

// 引入组件
var path   = require('path'), // node自带组件
    fse    = require('fs-extra'); // 通过npm下载

// 获取当前文件路径
var PWD = process.env.PWD || process.cwd(); // 兼容windows

gulp.task('init', function() {

    var dirs = ['dist','src','src/app','src/css','src/js','src/js/core','src/js/lib','src/js/ui','src/img','src/pic','src/sprite','psd'];
    
    dirs.forEach(function (item,index) {
        // 使用mkdirSync方法新建文件夹
        fse.mkdirSync(path.join(PWD + '/'+ item));
    })
    
    // 往index里写入的基本内容
    var template = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"/><title></title><meta name="apple-touch-fullscreen" content="yes" /><meta name="format-detection" content="telephone=no" /><meta name="apple-mobile-web-app-capable" content="yes" /><meta name="apple-mobile-web-app-status-bar-style" content="black" /></head><body></body></html>';

    fse.writeFileSync(path.join(PWD + '/src/app/index.html'), template);
    fse.writeFileSync(path.join(PWD + '/src/css/style.less'), '@charset "utf-8";');
})

//处理less
gulp.task('less', function () {

  return gulp.src('src/css/*.less')
    .pipe(sourcemaps.init())
    .pipe(less({

      paths: [ path.join(__dirname, 'less', 'includes') ]

    }))
    .pipe(autoprefixer({
       browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
       cascade: true, //是否美化属性值 默认：true 像这样：
      //-webkit-transform: rotate(45deg);
      //        transform: rotate(45deg);
      remove:true //是否去掉不必要的前缀 默认：true 
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/css'));

});

// 图片
gulp.task('images', function() {
  return gulp.src('src/img/**/*')
      .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
      .pipe(gulp.dest('dist/images'))
      .pipe(notify({ message: 'Images task complete' }));
});

//html
gulp.task('html', function() {
  return gulp.src('src/app/**/*.html')
      .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(gulp.dest('dist/app'))
      .pipe(notify({ message: 'html task complete' }));
});
// 清理
gulp.task('clean', function() {
  return gulp.src(['dist/css', 'dist/app'], {read: false})
      .pipe(clean());
});

// 预设任务
var browserSync = require('browser-sync').create();
gulp.task('default', ['clean'], function() {
  gulp.start('less', 'html');
   // 监听重载文件
    var files = [
      'src/app/**/*.html',
      'src/css/**/*.less',
      // 'src/js/**/*.js',
      'src/sprite/**/*.png'
    ]
   browserSync.init(files, {
      server: {
            baseDir: "./",
            directory: true
        },
      open: 'external',
      startPath: "dist/app/index.html"
    });

    gulp.start( 'watch');
});


gulp.task('watch', function() {

  // 看守所有.scss档
  gulp.watch('src/css/**/*.scss', ['styles']);

   // 看守所有.less档
  gulp.watch('src/css/**/*.less', ['less']);

  // 看守所有.js档
  // gulp.watch('src/js/**/*.js', ['scripts']);

  // 看守所有图片档
  gulp.watch('src/images/**/*', ['images']);

  //看守html
  gulp.watch('src/app/**/*.html', ['html']) ;

  livereload.listen();
  gulp.watch(['dist/**']).on('change', livereload.changed);
  gulp.watch(['dist/app/*.html']).on('change', livereload.changed);
  gulp.watch(['dist/css/*.css']).on('change', livereload.changed);

});