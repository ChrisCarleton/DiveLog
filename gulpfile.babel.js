import eslint from 'gulp-eslint';
import gulp from 'gulp';

gulp.task('lint', () => {
	return gulp
		.src(['service/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('test', ['lint'], () => {
	console.log('running tests...');
});

gulp.task('default', () => {
	console.log('gulping!');
});
