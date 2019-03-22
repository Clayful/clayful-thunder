const set = require('lodash.set');

module.exports = query => {

	query = query || {};

	if (typeof query === 'object') {
		return query;
	}

	if (typeof query !== 'string') {
		return {};
	}

	return query.split('&').reduce((o, segment) => {

		const [key, ...values] = segment.split('=');

		return set(o, [key], decodeURIComponent(values.join('=').replace(/\+/g, ' ')));

	}, {});

};