const get = require('lodash.get');
const set = require('lodash.set');
const camelCase = require('lodash.camelcase');

const AddressHandler = ({
	addressFields,
	translationKeys,
	searchAddressPlugin
}) => {

	function reset(type = 'all') {

		const fieldsToClear = type === 'recipient' ?
								addressFields.filter(({ recipient }) => recipient) :
								addressFields;

		fieldsToClear.forEach(({ $input }) => $input.val(null));
	}

	function getAddress() {

		return addressFields.reduce((o, { field, $input }) => {

			return set(o, field, $input.val() || null);

		}, {});

	}

	function setAddress(address) {

		addressFields.forEach(({ field, $input }) => {

			const value = get(address, field);

			return value === undefined ? null : $input.val(value);
		});
	}

	function validateAddress(address, validateRecipient = false) {

		const requireds = addressFields
							.filter(({ required }) => required)
							.filter(({ recipient }) => validateRecipient ? true : !recipient);

		for (const { field } of requireds) {

			if (get(address, field)) continue;

			const code = camelCase(['address', translationKeys[field] || field, 'required']);

			return code;
		}

		return null;
	}

	function searchAddress(callback) {

		searchAddressPlugin((err, address) => {

			if (err) {
				return callback(err);
			}

			setAddress(address);

			return callback(null, address);
		});

	}

	return {
		reset,
		getAddress,
		setAddress,
		validateAddress,
		searchAddress,
	};

};

AddressHandler.defaultAddress = () => ({
	name:     {
		first: null,
		last:  null,
		full:  null,
	},
	company:  null,
	postcode: null,
	country:  null,
	state:    null,
	city:     null,
	address1: null,
	address2: null,
	mobile:   null,
	phone:    null,
});

module.exports = AddressHandler;