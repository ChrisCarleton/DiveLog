import auth from './auth';
import bodyParser from 'body-parser';
import config from './config';
import cookieParser from 'cookie-parser';
import express from 'express';
import glob from 'glob';
import http from 'http';
import log from './logger';
import path from 'path';
import pug from 'pug';
import session from 'express-session';

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
	secret: 'my-secret',
	resave: false,
	saveUninitialized: false
}));	// TODO: Upgrade this to proper storage! (Use DynamoDb!)

auth(app);

const routeLoaders = glob.sync(path.resolve(__dirname, 'routes/**/*.routes.js'));
routeLoaders.forEach(loader => {
	log.debug('Loading route loader:', loader);
	require(loader)(app);
});

const homePage = pug.compileFile(
	path.resolve(__dirname, 'views/index.pug'));

app.get('/', (req, res) => {
	res.send(homePage({
		env: config.env
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
