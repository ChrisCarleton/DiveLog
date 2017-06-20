import config from './config';
import Store from 'connect-dynamodb';

const opts = {
	table: `divelog-${config.env}-sessions`	
};

export default new Store(opts);
