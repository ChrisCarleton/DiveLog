const config = {
	env: process.env.NODE_ENV || 'dev',
	logLevel: process.env.DIVELOG_LOG_LEVEL || 'info',
	logFile: process.env.DIVELOG_LOG_FILE,
	baseUrl: process.env.DIVELOG_BASE_URL || 'http://localhost:3000/',
	port: process.env.DIVELOG_PORT || 8100,
	forceSsl: process.env.DIVELOG_FORCE_SSL || false,

	awsKeyId: process.env.DIVELOG_AWS_KEY_ID || 'awskey',
	awsSecretKey: process.env.DIVELOG_AWS_SECRET_KEY || 'shhh!secret!',
	awsRegion: process.env.DIVELOG_AWS_REGION || 'us-east-1',
	awsDynamoEndpoint: process.env.DIVELOG_AWS_DYNAMO_ENDPOINT,

	googleApiKey: process.env.DIVELOG_GOOGLE_API_KEY || 'AIzaSyCw9yi0miRIFGZqGWHLr7OQvG2K_nj37fw',

	auth: {
		google: {
			consumerId: process.env.DIVELOG_GOOGLE_CONSUMER_ID || 'google-id',
			consumerSecret: process.env.DIVELOG_GOOGLE_CONSUMER_SECRET || 'google-secret'
		},
		github: {
			clientId: process.env.DIVELOG_GITHUB_CLIENT_ID || 'github-id',
			clientSecret: process.env.DIVELOG_GITHUB_CLIENT_SECRET || 'github-secret'
		},
		facebook: {
			clientId: process.env.DIVELOG_FACEBOOK_CLIENT_ID || 'facebook-id',
			clientSecret: process.env.DIVELOG_FACEBOOK_CLIENT_SECRET || 'facebook-secret'
		}
	}
};

export default config;
