import config from './config';
import bunyan from 'bunyan';

const logger = bunyan.createLogger({
	name: 'divelog-logger',
	level: config.logLevel,
	stream: process.stdout
});

export default logger;
