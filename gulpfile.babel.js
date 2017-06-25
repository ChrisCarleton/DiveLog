import coveralls from 'gulp-coveralls';
import eslint from 'gulp-eslint';
import glob from 'glob';
import gls from 'gulp-live-server';
import gulp from 'gulp';
import istanbul from 'gulp-istanbul';
import mkdirp from 'mkdirp';
import mocha from 'gulp-mocha';
import path from 'path';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import util from 'gulp-util';
import webpack from 'webpack';
//import WebpackDevServer from 'webpack-dev-server';

const isparta = require('isparta');

gulp.task('lint', () => {
	return gulp
		.src(['service/**/*.js', 'web/**/*.js', 'web/**/*.jsx', 'tests/**/*.js', 'gulpfile.babel.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('cover', () => {
	return gulp
		.src(['service/**/*.js'])
		.pipe(istanbul({
			instrumenter: isparta.Instrumenter,
			includeUntested: true
		}))
		.pipe(istanbul.hookRequire());
});

gulp.task('ensure-dist-directory', done => {
	mkdirp(path.join(__dirname, 'dist'), done);
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
	process.env.DIVELOG_LOG_FILE = path.resolve(__dirname, 'logs/tests.log');

	return gulp
		.src(['tests/**/*.tests.js'])
		.pipe(mocha({
			compilers: ['js:babel-core/register'],
			reporter: 'spec',
			timeout: 4000
		}))
		.pipe(istanbul.writeReports({
			dir: './coverage',
			reporters: ['lcov', 'text-summary']
		}))
		.on('error', process.exit.bind(process, 1));
});

gulp.task('report-coverage', ['test'], () => {
	return gulp
		.src('coverage/lcov.info')
		.pipe(coveralls());
});

gulp.task('bundle', ['lint', 'ensure-dist-directory'], done => {
	webpack(
		require('./webpack.config.js'),
		(err, stats) => {
			if (err) {
				throw new util.PluginError('webpack', err);
			}

			util.log('[webpack]', stats.toString());

			done();
		});
});

gulp.task('minify', ['bundle'], () => {
	return gulp
		.src('dist/bundle.js')
		.pipe(uglify())
		.pipe(rename('bundle.min.js'))
		.pipe(gulp.dest('dist/'));
});

gulp.task('dev-server', ['ensure-log-directory', 'ensure-dynamo-tables', 'bundle'], () => {
	const server = gls(
		'service/index.js',
		{ env: 
			{
				NODE_ENV: 'dev-server',
				DIVELOG_PORT: 3000,
				DIVELOG_LOG_LEVEL: 'trace',
				DIVELOG_LOG_FILE: path.resolve(__dirname, 'logs/dev.log'),
				DIVELOG_AWS_DYNAMO_ENDPOINT: 'http://localhost:7777'
			}
		},
		false);

	gulp.watch(['service/**/*.js', 'service/views/**/*.pug'], () => {
		server.start.bind(server)();
		util.log(util.colors.yellow.bold('File modification detected; dev server has been restarted.'));
	});

	util.log(
		util.colors.yellow.bold('Starting dev server on port', 3000, '... Logs will be written to:'),
		util.colors.yellow('./logs/dev.log'));
	server.start();

});

gulp.task('default', ['dev-server']);
