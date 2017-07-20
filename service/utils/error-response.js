export const errorIds = {
	'invalid-input': 1000,
	'username-taken': 1010,
	'email-taken': 1020,
	'server-error': 2000,
	'resource-not-found': 2100,
	'authentication-failed': 3000,
	'not-authorized': 3100,
	'forbidden-action': 3200
};

export default function(res, errorId, title, description, statusCode) {
	res.status(statusCode || 400).json({
		errorId: errorId,
		error: title,
		details: description
	});
}

export function badRequestResponse(res, details) {
	res.status(400).json({
		errorId: errorIds['invalid-input'],
		error: 'The request could not be completed because there was a problem with the data provided',
		details: details
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

export function forbiddenActionResponse(res, details) {
	res.status(403).json({
		errorId: errorIds['forbidden-action'],
		error: 'The action or resource being requested is forbidden',
		details: details
	});
}

export function resourceNotFoundResponse(res) {
	res.status(404).json({
		errorId: errorIds['resource-not-found'],
		error: 'The resource you are looking for could not be found',
		details: 'Check the URL provided and ensure that it is correct. Also, make sure you are using the correct HTTP verb. (GET, POST, etc.)'
	});
}
