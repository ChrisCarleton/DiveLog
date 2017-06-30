import AWS from 'aws-sdk';
import config from './config';
import duration from 'parse-duration';
import connectDynamoDb from 'connect-dynamodb';

export default function(expressSession) {

	const Store = connectDynamoDb({ session: expressSession });
	const opts = {
		table: `divelog-${config.env}-sessions`,
		reapInterval: duration('2h'),
		prefix: '',
		session: expressSession
	};

	if (config.awsDynamoEndpoint) {
		opts.client = new AWS.DynamoDB({
			accessKeyId: config.awsKeyId,
			secretAccessKey: config.awsSecretKey,			
			region: config.awsRegion,
			endpoint: config.awsDynamoEndpoint
				? new AWS.Endpoint(config.awsDynamoEndpoint)
				: undefined
		});
	}

	return new Store(opts);

}
