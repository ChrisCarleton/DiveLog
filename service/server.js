import auth from './auth';
import bodyParser from 'body-parser';
import config from './config';
import cookieParser from 'cookie-parser';
import express from 'express';
// import forceSsl from 'express-force-ssl';
import glob from 'glob';
import http from 'http';
import initialState from './initial-state';
import log from './logger';
import path from 'path';
import pug from 'pug';
import session from 'express-session';
import SessionStore from './session-store';

process.on('uncaughtException', exception => {
	log.fatal('A fatal, uncaught exception has occured:', exception);
	process.exit(1);
});

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

// if (config.forceSsl) {
// 	app.use(forceSsl);
// }

const sessionStore = SessionStore(session);
app.use(session({
	store: sessionStore,
	secret: 'my-secret',
	resave: false,
	saveUninitialized: false
}));

auth(app);

const routeLoaders = glob.sync(path.resolve(__dirname, 'routes/**/*.routes.js'));
routeLoaders.forEach(loader => {
	log.debug('Loading route loader:', loader);
	require(loader)(app);
});

const homePage = pug.compileFile(
	path.resolve(__dirname, 'views/index.pug'));

let bundleLocation;
switch (config.env) {
	case 'dev-server':
		bundleLocation = 'http://localhost:3002/bundle.js';
		break;

	case 'production':
		bundleLocation = '/public/bundle.min.js';
		break;

	default:
		bundleLocation = '/public/bundle.js';
		break;
}

const styleLocation = config.env === 'production' ? '/public/bundle.css' : null;

app.use(
	'/public',
	express.static(
		path.resolve(__dirname, '../dist'),
		{
			index: false
		}));

app.get('*', (req, res) => {
	res.send(homePage({
		env: config.env,
		baseUrl: config.baseUrl,
		styleLocation: styleLocation,
		bundleLocation: bundleLocation,
		initialState: JSON.stringify(initialState(req))
	}));
});

const server = http.createServer(app);
server.listen(config.port);

log.info('Server started on port', config.port);

const exportable = {
	app: app,
	server: server
};

export default exportable;
module.exports = exportable;
