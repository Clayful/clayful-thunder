const get = require('lodash.get');

module.exports = function(customer) {

	if (!customer) return null;

	for (const field of this.options.customerIdentity) {

		const value = get(customer, field);

		if (value) {
			return value;
		}

	}

	return null;
};