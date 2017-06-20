export const errorIds = {
	'invalid-input': 1000,
	'username-taken': 1010,
	'email-taken': 1020,
	'server-error': 2000
}

export default function(res, errorId, title, description, statusCode) {
	res.status(statusCode || 400).json({
		errorId: errorId,
		error: title,
		details: description
	});
}
