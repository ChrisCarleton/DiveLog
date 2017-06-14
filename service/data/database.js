import config from '../config';
import vogels from 'vogels';

vogels.AWS.config.update({
	accessKeyId: config.awsKeyId,
	secretAccessKey: config.awsSecretKey,
	region: config.awsRegion
});

export default vogels;
