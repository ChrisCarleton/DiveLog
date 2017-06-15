import coveralls from 'gulp-coveralls';
import eslint from 'gulp-eslint';
import gulp from 'gulp';
import istanbul from 'gulp-istanbul';
import mkdirp from 'mkdirp';
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

gulp.task('ensure-log-directory', done => {
	mkdirp(path.join(__dirname, 'logs'), done);
});

gulp.task('test', ['lint', 'cover', 'ensure-log-directory'], () => {
	process.env.DIVELOG_LOG_LEVEL = 'debug';
	process.env.DIVELOG_LOG_FILE = path.join(__dirname, 'logs/tests.log');

	if (process.env.NODE_ENV !== 'system-test') {
		process.env.DIVELOG_AWS_DYNAMO_ENDPOINT = 'http://localhost:7777';
	}

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
