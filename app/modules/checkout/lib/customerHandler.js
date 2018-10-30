const get = require('lodash.get');
const set = require('lodash.set');
const camelCase = require('lodash.camelcase');

module.exports = ({
	customerFields,
	translationKeys,
}) => {

	function setCustomer(customer) {

		if (!customer) return;

		customerFields.forEach(({ field, $input }) => {

			$input.val(get(customer, field) || null);
		});

	}

	function getCustomer() {

		return customerFields.reduce((o, { field, $input }) => {
			return set(o, field, $input.val() || null);
		}, {});

	}

	function validateCustomer(customer) {

		for (const { field, required } of customerFields) {

			if (!required) continue;

			const value = get(customer, field);

			if (!value) {
				return camelCase(['customer', translationKeys[field] || field, 'required']);
			}

		}

		return null;

	}

	return {
		setCustomer,
		getCustomer,
		validateCustomer
	};

};