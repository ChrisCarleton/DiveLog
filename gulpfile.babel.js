import coveralls from 'gulp-coveralls';
import eslint from 'gulp-eslint';
import glob from 'glob';
import gls from 'gulp-live-server';
import gulp from 'gulp';
import istanbul from 'gulp-istanbul';
import mkdirp from 'mkdirp';
import mocha from 'gulp-mocha';
import nsp from 'gulp-nsp';
import path from 'path';
import util from 'gulp-util';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

const isparta = require('isparta');

gulp.task('lint', () => {
	return gulp
		.src([
			'service/**/*.js',
			'web/**/*.js',
			'web/**/*.jsx',
			'tests/**/*.js',
			'ui-tests/**/*.js',
			'*.js'])
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

gulp.task('ensure-log-directory', done => {
	mkdirp(path.join(__dirname, 'logs'), done);
});

gulp.task('ensure-dist-directory', done => {
	mkdirp(path.join(__dirname, 'dist'), done);
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

gulp.task('nsp', done => {
	nsp({ package: path.resolve(__dirname, 'package.json') }, done);
});

gulp.task('test', ['lint', 'cover', 'ensure-log-directory', 'ensure-dynamo-tables'], () => {
	process.env.DIVELOG_LOG_LEVEL = 'trace';
	process.env.DIVELOG_LOG_FILE = path.resolve(__dirname, 'logs/tests.log');

	return gulp
		.src(['tests/**/*.tests.js'])
		.pipe(mocha({
			compilers: ['js:babel-core/register'],
			reporter: 'spec',
			timeout: 12000
		}))
		.on('error', process.exit.bind(process, 1))
		.pipe(istanbul.writeReports({
			dir: './coverage',
			reporters: ['lcov', 'text-summary']
		}))
		.on('end', process.exit.bind(process, 0));
});

gulp.task('test-full', ['nsp', 'test']);

gulp.task('report-coverage', () => {
	return gulp
		.src('coverage/lcov.info')
		.pipe(coveralls());
});

gulp.task('test-ui', ['lint', 'bundle-dev'], () => {
	process.env.DIVELOG_LOG_LEVEL = 'trace';
	process.env.DIVELOG_LOG_FILE = path.resolve(__dirname, 'logs/tests.log');

	return gulp
		.src('ui-tests/**/*.tests.js')
		.pipe(mocha({
			compilers: ['js:babel-core/register'],
			reporter: 'spec',
			timeout: 12000
		}));
});

function bundle(config, done) {
	webpack(
		config,
		(err, stats) => {
			if (err) {
				throw new util.PluginError('webpack', err);
			}

			util.log('[webpack]', stats.toString());

			done();
		});
}

gulp.task('bundle-dev', ['ensure-dist-directory'], done => {
	bundle(require('./webpack.dev.js'), done);
});

gulp.task('bundle-prod', ['bundle-dev'], done => {
	bundle(require('./webpack.prod.js'), done);
});

gulp.task('bundle', ['bundle-prod']);

gulp.task('webpack-server', done => {
	const compiler = webpack(require('./webpack.dev.js'));

	new WebpackDevServer(compiler)
		.listen(3002, 'localhost', err => {
			if (err) {
				throw new util.PluginError('webpack-dev-server', err);
			}

			util.log('[webpack-dev-server]', 'Webpack Dev Server started on port 3002.');

			done();
		});
});

gulp.task('dev-server', ['ensure-log-directory', 'ensure-dynamo-tables', 'webpack-server'], () => {
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

gulp.task('test-data', ['ensure-dynamo-tables'], done => {
	util.log('Creating test data...');
	require('./create-test-data')(util)
		.then(users => {
			util.log('Test data has been created.');
			util.log('The following user accounts have been created:', users);
			util.log('The default password is "divelogs" for all accounts.');
			util.log('Additionally, an administrative account has been added:');
			util.log('\tusername: "TestAdmin"');
			util.log('\tpassword: "adm!n"\n');
			util.log('Enjoy!');
			done();
		})
		.catch(err => {
			done(new util.PluginError('test data generator', err));
		});
});

gulp.task('default', ['dev-server']);
