import config from './config';
import bunyan from 'bunyan';

let streams;
if (config.logFile) {
	streams = [{
		level: config.logLevel,
		path: config.logFile
	}];
} else {
	streams = [{
		level: config.logLevel,
		stream: process.stdout
	}];
}

const logger = bunyan.createLogger({
	name: 'divelog-logger',
	level: config.logLevel,
	streams: streams
});

logger.debug('Logger initialized.', config.logFile ? `Logging to ${config.logFile}.` : 'Logging to stdout.');

export default logger;
