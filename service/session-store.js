import AWS from 'aws-sdk';
import config from './config';
import duration from 'parse-duration';
import connectDynamoDb from 'connect-dynamodb';

export default function(expressSession) {

	const Store = connectDynamoDb({ session: expressSession });
	const opts = {
		table: `divelog-${config.env}-sessions`,
		AWSConfigJSON: {
			accessKeyId: config.awsKeyId,
			secretAccessKey: config.awsSecretKey,
			region: config.awsRegion
		},
		reapInterval: duration('2h'),
		prefix: '',
		session: expressSession
	};

	if (config.awsDynamoEndpoint) {
		opts.client = new AWS.DynamoDB({
			region: config.awsRegion,
			endpoint: new AWS.Endpoint(config.awsDynamoEndpoint)
		});
	}

	return new Store(opts);

}
