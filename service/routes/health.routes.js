import { getHealth } from '../controllers/health.controller';

module.exports = function(app) {
	app.get('/api/health/', getHealth);
}
