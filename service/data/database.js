import config from '../config';
import log from '../logger';
import vogels from 'vogels-promisified';

const dynamoConfig = {
	accessKeyId: config.awsKeyId,
	secretAccessKey: config.awsSecretKey,
	region: config.awsRegion,
	endpoint: config.awsDynamoEndpoint
};

vogels.AWS.config.update(dynamoConfig);

log.debug('Using DynamoDb configuration:', dynamoConfig);

export default vogels;
module.exports = vogels;
