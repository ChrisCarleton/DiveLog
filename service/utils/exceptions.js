class ExtendableError extends Error {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error(message)).stack;
		}
	}
}

export class ValidationError extends ExtendableError {
	constructor(message, details) {
		super(message);
		this.name = 'ValidationError';
		this.details = details;
	}
}

export class ForbiddenActionError extends ExtendableError {
	constructor(message) {
		super(message);
		this.name = 'ForbiddenActionError';
	}
}

export class EmailInUseError extends ExtendableError {
	constructor(message) {
		super(message);
		this.name = 'EmailInUseError';
	}
}

export class MissingEmailError extends ExtendableError {
	constructor(message) {
		super(message);
		this.name = 'MissingEmailError';
	}
}

export class BadPasswordError extends ExtendableError {
	constructor(message) {
		super(message);
		this.name = 'BadPasswordError';
	}
}

export class WeakPasswordError extends ExtendableError {
	constructor(message) {
		super(message);
		this.name = 'WeakPasswordError';
	}
}

export class NoSuchUserError extends ExtendableError {
	constructor(message) {
		super(message);
		this.name = 'NoSuchUserError';
	}
}

export class RejectedPasswordResetError extends ExtendableError {
	constructor(message) {
		super(message);
		this.name = 'RejectedPasswordResetError';
	}
}
