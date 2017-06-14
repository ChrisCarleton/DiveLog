import express from 'express';
import http from 'http';

const app = express();

app.get('/', (req, res) => {
	res.send('Hello!');
});

const server = http.createServer(app);
server.listen(8100);

console.log('server started.');
