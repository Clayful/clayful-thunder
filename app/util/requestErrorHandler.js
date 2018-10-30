const get = require('lodash.get');

const HandlerError = (code, message) => {

	const error = new Error(message);

	error.code = code;

	return error;

};

module.exports = function(res, codeToMessage, callback = () => {}) {

	if (!res.error) {
		// Not an error case
		return callback();
	}

	// Find a Clayful error code
	const errorCode = get(res, 'errorCode', null);

	const messageGetter = codeToMessage[errorCode];
	const defaultMessage = codeToMessage.default;
	const message = messageGetter ? (
		typeof messageGetter === 'function' ?
			messageGetter(res) || defaultMessage :
			messageGetter.message || messageGetter || defaultMessage
	) : defaultMessage;

	if (message) {
		this.plugins.notification(get(messageGetter, 'type') || 'error', message);
		return callback(HandlerError(errorCode, message));
	}

	return callback(HandlerError('unknown', 'Unknown Error'));

};