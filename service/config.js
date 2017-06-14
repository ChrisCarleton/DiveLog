const config = {
	env: process.env.NODE_ENV || 'dev',
	logLevel: process.env.DIVELOG_LOG_LEVEL || 'info',
	baseUrl: process.env.DIVELOG_BASE_URL || 'http://localhost:8100/',

	awsKeyId: process.env.DIVELOG_AWS_KEY_ID,
	awsSecretKey: process.env.DIVELOG_AWS_SECRET_KEY,
	awsRegion: process.env.DIVELOG_AWS_REGION || 'ca-central-1'

	auth: {
		google: {
			consumerId: process.env.DIVELOG_GOOGLE_CONSUMER_ID,
			consumerSecret: process.env.DIVELOG_GOOGLE_CONSUMER_SECRET
		},
		github: {
			clientId: process.env.DIVELOG_GITHUB_CLIENT_ID,
			clientSecret: process.env.DIVELOG_GITHUB_CLIENT_SECRET
		}
	}
};

export default config;
