import eslint from 'gulp-eslint';
import gulp from 'gulp';
import mocha from 'gulp-mocha';

gulp.task('lint', () => {
	return gulp
		.src(['service/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('test', ['lint'], () => {
	return gulp
		.src(['tests/**/*.tests.js'])
		.pipe(mocha());
});

gulp.task('default', () => {
	console.log('gulping!');
});
