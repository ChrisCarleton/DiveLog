import config from './service/config';
import coveralls from 'gulp-coveralls';
import eslint from 'gulp-eslint';
import gulp from 'gulp';
import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';
import path from 'path';

gulp.task('lint', () => {
	return gulp
		.src(['service/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('cover', () => {
	const isparta = require('isparta').Instrumenter;

	return gulp
		.src([path.resolve(__dirname, 'service/**/*.js')])
		.pipe(istanbul({
			instrumenter: isparta,
			includeUntested: true
		}))
		.pipe(istanbul.hookRequire());
});

gulp.task('test', ['lint', 'cover'], () => {
	config.logFile = 'logs/test.log';
	return gulp
		.src(['tests/**/*.tests.js'])
		.pipe(mocha({
			compilers: ['js:babel-core/register']
		}))
		.pipe(istanbul.writeReports({
			dir: './coverage',
			reporters: ['lcov', 'text-summary']
		}));
});

gulp.task('report-coverage', () => {
	return gulp
		.src('coverage/lcov.info')
		.pipe(coveralls());
});

gulp.task('default', () => {
	console.log('gulping!');
});
