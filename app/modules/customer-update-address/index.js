const get = require('lodash.get');
const set = require('lodash.set');
const camelCase = require('lodash.camelcase');

module.exports = Thunder => {

	const translationKey = {
		'name.first': 'firstName',
		'name.last':  'lastName',
		'name.full':  'fullName',
	};

	// Implementation
	const implementation = {
		name: 'customer-update-address'
	};

	implementation.options = () => ({

		recipientFields: Thunder.options.recipientFields,
		addressDisabled: Thunder.options.addressDisabled,

		onUpdate: function($container, context) {

			Thunder.notify('success', context.m('updateSuccess'));
		},

	});

	implementation.pre = function(context, callback) {

		const disabledAddressFields =
			Thunder.util.parseArrayString(context.options.addressDisabled)
					.reduce((o, field) => set(o, field, true), {});

		context.useSearchAddress = !!Thunder.plugins.searchAddress;

		context.disabled = field =>
			disabledAddressFields[field] &&
			context.useSearchAddress ? 'readonly' : '';

		context.recipientFields = Thunder.util.parseArrayString(context.options.recipientFields).map(field => {

			const [key, required] = field.split(':');

			return {
				required:       required === 'required',
				key:            key,
				translationKey: translationKey[key] || key
			};

		});

		context.addressFields = [
			{ required: true, key: 'country', translationKey: 'country', },
			{ required: false, key: 'state', translationKey: 'state', },
			{ required: true, key: 'city', translationKey: 'city', },
			{ required: true, key: 'address1', translationKey: 'address1', },
			{ required: false, key: 'address2', translationKey: 'address2', },
			{ required: true, key: 'postcode', translationKey: 'postcode', },
		];

		const errors = {
			default: context.m('customerReadFailed')
		};

		$.when(
			Thunder.request({
				method: 'GET',
				url:    '/v1/countries',
				query:  { fields: 'code', limit: 120, page: 1 },
			}),
			Thunder.request({
				method: 'GET',
				url:    '/v1/countries',
				query:  { fields: 'code', limit: 120, page: 2 },
			}),
			Thunder.request({
				method: 'GET',
				url:    '/v1/countries',
				query:  { fields: 'code', limit: 120, page: 3 },
			}),
			Thunder.request({
				method: 'GET',
				url:    '/v1/me',
				query:  { fields: 'address' }
			})
		).then((
			countries1,
			countries2,
			countries3,
			customer
		) => {

			context.countries = [].concat(
				countries1[0],
				countries2[0],
				countries3[0]
			);

			context.address = customer[0].address.primary || { name: {} };

			return callback(null, context);

		}, err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $form = $(this).find('.thunder--customer-address-update-form');
		const $button = $form.find('.thunder--update-address');
		const $searchAddress = $(this).find('.thunder--search-address');
		const $disabledAddressInputs = $(this).find('.thunder--address-location div [readonly]').parent();

		const buttonSpinner = Thunder.util.makeAsyncButton($button, { bind: false });

		const recipientFields = context.recipientFields.map(f => f.key);
		const addressFields = context.addressFields.map(f => f.key);
		const allFieldsMap = [
			...recipientFields,
			...addressFields
		].reduce((o, field) => set(o, [field], true), {});

		const $fields = [].concat(recipientFields, addressFields)
						.reduce((o, key) => set(o, [key], $form.find(`[name="${key}"]`)), {});

		addressToForm(context.address);

		$searchAddress.on('click', searchAddress);
		$disabledAddressInputs.on('click', searchAddress);

		Thunder.util.makeRecaptcha({
			componentName: implementation.name,
			button:        $button,
			validate:      validateAddress,
			callback:      function(token, resetRecaptcha) {

				buttonSpinner.run();

				const primaryAddress = Thunder.util.formToJSON($form.serializeArray());
				const recaptcha = Thunder.util.unsetRecaptcha(primaryAddress);

				const data = { address: { primary: primaryAddress } };

				const resetState = () => {
					buttonSpinner.done();
					return resetRecaptcha && resetRecaptcha();
				};

				const errors = {
					'invalid-postcode':  context.m('invalidPostcode'),
					'postcode-required': context.m('postcodeRequired'),
					default:             context.m('updateFailed'),
					validation: err => {

						const [, field] = err.validation.source.split('address.primary.');

						if (!field || !allFieldsMap[field]) return;

						return context.m(camelCase(['invalid', translationKey[field] || field]));
					},
				};

				return Thunder.request({
					method:    'PUT',
					url:       '/v1/me',
					data:      data,
					recaptcha: recaptcha
				}).then(data => {

					const address = get(data, 'address.primary');

					addressToForm(address);

					Thunder.execute(
						context.options.onUpdate,
						$container,
						context,
						address
					);

					return resetState();

				}, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors,
					err => resetState()
				));

			}
		});

		function validateAddress() {

			const address = Thunder.util.formToJSON($form.serializeArray());

			const requiredFields = [].concat(
				context.recipientFields,
				context.addressFields
			).filter(f => f.required).map(f => f.key);

			for (const field of requiredFields) {

				if (!get(address, field, null)) {
					Thunder.notify('error', context.m(`${translationKey[field] || field}Required`));
					return false;
				}

			}

			return true;

		}

		function addressToForm(address, onlyAddressFields = false) {

			if (!address) return;

			const fields = onlyAddressFields ?
							addressFields :
							[].concat(recipientFields, addressFields);

			fields.forEach(field => {

				const value = field === 'country' ?
								get(address, `${field}.code`, get(address, field, null)) :
								get(address, field, null);

				$fields[field].val(value);
			});
		}

		function searchAddress(event) {

			event.preventDefault();

			Thunder.plugins.searchAddress((err, address) => {

				if (err) {
					return Thunder.notify('error', err.message);
				}

				addressToForm(address, true);
			});

		}

	};

	return implementation;

};