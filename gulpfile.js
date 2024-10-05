import gulp from 'gulp';
import sass from 'gulp-dart-sass';
import concat from 'gulp-concat';

//sass
gulp.task('sass', function (cb) {
	gulp.src(['styles/*.scss', 'styles/**/*.scss'])
		.pipe(sass({ outputStyle: 'compressed' }))
		.pipe(concat('bugvolution8.min.css'))
		.pipe(gulp.dest('dist/'));
	cb();
});

gulp.task('watch', function (cb) {
	gulp.watch('styles/**/*.scss', gulp.series('sass'));
});

gulp.task('default', gulp.parallel('sass'));
