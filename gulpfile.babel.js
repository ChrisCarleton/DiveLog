import coveralls from 'gulp-coveralls';
import eslint from 'gulp-eslint';
import glob from 'glob';
import gulp from 'gulp';
import istanbul from 'gulp-istanbul';
import mkdirp from 'mkdirp';
import mocha from 'gulp-mocha';
import path from 'path';

gulp.task('lint', () => {
	return gulp
		.src(['service/**/*.js', 'tests/**/*.js', 'gulpfile.babel.js'])
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

gulp.task('ensure-dist-directory', done => {
	mkdirp(path.join(__dirname, 'web/dist'), done);
});

gulp.task('ensure-log-directory', done => {
	mkdirp(path.join(__dirname, 'logs'), done);
});

gulp.task('ensure-dynamo-tables', done => {
	if (process.env.NODE_ENV === 'system-test') {
		return done();
	}

	process.env.DIVELOG_AWS_DYNAMO_ENDPOINT =
		process.env.DIVELOG_AWS_DYNAMO_ENDPOINT || 'http://localhost:7777';
	const database = require('./service/data/database');
	const tables = glob.sync('./service/data/**/*.table.js');
	tables.forEach(table => {
		require(table);
	});

	database.createTables(done);
});

gulp.task('test', ['lint', 'cover', 'ensure-log-directory', 'ensure-dynamo-tables'], () => {
	process.env.DIVELOG_LOG_LEVEL = 'trace';
	process.env.DIVELOG_LOG_FILE = path.join(__dirname, 'logs/tests.log');

	return gulp
		.src(['tests/**/*.tests.js'])
		.pipe(mocha({
			compilers: ['js:babel-core/register'],
			timeout: 4000
		}))
		.on('error', process.exit.bind(process, 1))
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
	// TODO: Run dev server
});
