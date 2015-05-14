var jshint = require('gulp-jshint'),
    gulp = require('gulp');

gulp.task('lint', function() {
  return gulp.src(['index.js', 'lib/**/*.js', 'test/**/*.js'])
    .pipe(jshint({ node: true }))
    .pipe(jshint.reporter('default'));
});
