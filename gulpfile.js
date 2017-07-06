var gulp = require('gulp')
var pug = require('gulp-pug')

gulp.task('index', function buildHTML () {
  return gulp.src('views/index.pug')
  .pipe(pug({}))
  .pipe(gulp.dest('.'))
})

gulp.task('projects', function buildHTML () {
  return gulp.src('views/projects/**/*.pug')
  .pipe(pug({}))
  .pipe(gulp.dest('./projects/'))
})

gulp.task('default', ['index', 'projects'])
