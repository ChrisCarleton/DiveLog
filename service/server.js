import express from 'express';
import http from 'http';
import log from './logger';

const app = express();

app.get('/', (req, res) => {
	res.send('Hello!');
});

const server = http.createServer(app);
server.listen(8100);

log.info('server started.');
