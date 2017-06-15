import auth from './auth';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import http from 'http';
import log from './logger';

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

auth(app);

app.get('/', (req, res) => {
	res.send('Hello!');
});

const server = http.createServer(app);
server.listen(8100);

log.info('Server started on port 8100.');

const exportable = {
	app: app,
	server: server
};

export default exportable;
module.exports = exportable;
