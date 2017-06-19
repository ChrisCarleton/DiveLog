const config = {
	env: process.env.NODE_ENV || 'dev',
	logLevel: process.env.DIVELOG_LOG_LEVEL || 'info',
	logFile: process.env.DIVELOG_LOG_FILE,
	baseUrl: process.env.DIVELOG_BASE_URL || 'http://localhost:8100/',

	awsKeyId: process.env.DIVELOG_AWS_KEY_ID || 'awskey',
	awsSecretKey: process.env.DIVELOG_AWS_SECRET_KEY || 'shhh!secret!',
	awsRegion: process.env.DIVELOG_AWS_REGION || 'ca-central-1',
	awsDynamoEndpoint: process.env.DIVELOG_AWS_DYNAMO_ENDPOINT,

	auth: {
		google: {
			consumerId: process.env.DIVELOG_GOOGLE_CONSUMER_ID || 'google-id',
			consumerSecret: process.env.DIVELOG_GOOGLE_CONSUMER_SECRET || 'google-secret'
		},
		github: {
			clientId: process.env.DIVELOG_GITHUB_CLIENT_ID || 'github-id',
			clientSecret: process.env.DIVELOG_GITHUB_CLIENT_SECRET || 'github-secret'	
		}
	}
};

export default config;
