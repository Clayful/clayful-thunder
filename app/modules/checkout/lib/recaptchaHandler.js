const set = require('lodash.set');

module.exports = requiredResponse => {

	const handler = {
		counter: 0,
		token: [],
		requiredResponse
	};

	handler.execute = token => {

		const requiredComponents = Object.keys(handler.requiredResponse);
		const requiredLength = requiredComponents.length;

		if (requiredLength === 0) {
			// If a number of required responses is 0,
			// simply return an empty object.
			return {};
		}

		handler.token = handler.token.concat(token).filter(token => token);

		if (++handler.counter === 2 &&
			requiredLength === handler.token.length) {

			const result = requiredComponents.reduce((o, c, i) => {
				return set(o, c, handler.token[i]);
			}, {});

			handler.reset();

			return result;

		} else {

			return null;
		}

	};

	handler.reset = () => {
		handler.counter = 0;
		handler.token = [];
	};

	return handler;

};