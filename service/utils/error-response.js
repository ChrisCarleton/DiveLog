export const errorIds = {
	'invalid-input': 1000,
	'username-taken': 1010,
	'email-taken': 1020,
	'server-error': 2000,
	'authentication-failed': 3000
}

export default function(res, errorId, title, description, statusCode) {
	res.status(statusCode || 400).json({
		errorId: errorId,
		error: title,
		details: description
	});
}

export function serverErrorResponse(res) {
	res.status(500).json({
		errorId: errorIds['server-error'],
		error: 'Internal server error',
		details: 'An unknown error occured while attempting to create your account. Please try again later.'
	});
}
