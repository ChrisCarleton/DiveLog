export const errorIds = {
	'invalid-input': 1000,
	'username-taken': 1010,
	'email-taken': 1020,
	'server-error': 2000,
	'authentication-failed': 3000,
	'not-authorized': 3100
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

export function notAuthroizedResponse(res) {
	res.status(401).json({
		errorId: errorIds['not-authorized'],
		error: 'You are not authorized to perform this action',
		details: 'You may not be logged in or you may not have permission to perform the requested action.'
	});
}
