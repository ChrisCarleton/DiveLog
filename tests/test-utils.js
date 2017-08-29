import _ from 'lodash';
import Bluebird from 'bluebird';

export function purgeTable(table, hashKey, rangeKey) {
	return table
		.scan()
		.limit(500)
		.loadAll()
		.execAsync()
		.then(results => {
			const promises = _.map(results.Items, (result) => {
				const item = {};
				item[hashKey] = result.get(hashKey);

				if (rangeKey) {
					item[rangeKey] = result.get(rangeKey);
				}

				return table.destroyAsync(item);
			});

			return Bluebird.all(promises);
		});
}
