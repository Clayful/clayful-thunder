const get = require('lodash.get');
const camelCase = require('lodash.camelcase');

module.exports = Thunder => {

	const translationKey = {
		'name.first': 'firstName',
		'name.last':  'lastName',
		'name.full':  'fullName',
	};

	// Implementation
	const implementation = {
		name: 'customer-register'
	};

	implementation.options = () => ({

		fields:          Thunder.options.customerRegistrationFields,
		birthdateFormat: Thunder.options.dateInputFormat,
		socialApps:      Thunder.options.socialApps.join(','),

		onRegister: function($container, context, customer) {

			Thunder.notify('success', context.m('registerSuccess'));

			Thunder.render($container, 'customer-login');
		},
		onSocialRegister: function($container, context, data) {

			if (data.error) {
				if (data.error === 'duplicated-email') {
					return Thunder.notify('error', context.m('duplicatedEmail'));
				}
			}

			Thunder.notify('success', context.m('registerSuccess'));

			location.replace(Thunder.options.root);
		}

	});

	implementation.pre = function(context, callback) {

		const birthOptions = {
			YYYY: { key: 'birthYear', translationKey: 'year', tester: /^\d{4}$/ },
			MM:   { key: 'birthMonth', translationKey: 'month', tester: /^\d{1,2}$/ },
			DD:   { key: 'birthDate', translationKey: 'date', tester: /^\d{1,2}$/ }
		};

		const birthdateFormats = context.options.birthdateFormat.split('-');

		context.fields = Thunder.util.parseArrayString(context.options.fields).map(field => {

			const [key, required] = field.split(':');

			return {
				required:       required === 'required',
				key:            key,
				translationKey: translationKey[key] || key
			};

		});

		context.birthdateFields = birthdateFormats.map((format, i) => {

			return $.extend({
				last: i === birthdateFormats.length - 1
			}, birthOptions[format]);

		});

		context.social = () => Thunder.uis['social-login']({
			type:    'register',
			vendors: context.options.socialApps
		});

		return callback(null, context);

	};

	implementation.init = function(context) {

		const socialData = Thunder.util.handleSocialLogin();

		if (socialData) {

			Thunder.execute(
				context.options.onSocialRegister,
				$container,
				context,
				socialData
			);
		}

		const $container = $(this);
		const $form = $(this).find('.thunder--register-form');
		const $button = $form.find('.thunder--register-customer');
		const buttonSpinner = Thunder.util.makeAsyncButton($button, { bind: false });

		Thunder.util.makeRecaptcha({
			componentName: implementation.name,
			button:        $button,
			validate:      validateData,
			callback:      function(token, resetRecaptcha) {

				buttonSpinner.run();

				const resetState = () => {
					buttonSpinner.done();
					return resetRecaptcha && resetRecaptcha();
				};

				const success = customer => {

					Thunder.execute(
						context.options.onRegister,
						$container,
						context,
						customer
					);

					return resetState();
				};

				const fail = err => Thunder.util.requestErrorHandler(err.responseJSON, {
					'duplicated-email':   context.m('duplicatedEmail'),
					'duplicated-user-id': context.m('duplicatedUserId'),
					default:              context.m('registerFailed'),
					validation: err => {

						const [, ...path] = err.validation.source.split('.');
						const field = path.join('.');

						return context.m(camelCase(['invalid', translationKey[field] || field]));
					},
				}, err => {
					return resetState();
				});

				return Thunder.request({
					method: 'POST',
					url:    '/v1/me',
					data:   getCustomer(),
				}).then(success, fail);

			}

		});

		function getCustomer() {

			const birthFields = [
				'birthYear',
				'birthMonth',
				'birthDate',
			];

			const data = Thunder.util.formToJSON($form.serializeArray());

			if (birthFields.every(field => data[field])) {

				data.birthdate = new Date(
					data.birthYear,
					data.birthMonth - 1,
					data.birthDate
				);
			}

			birthFields.forEach(field => delete data[field]);

			return data;

		}

		function validateData() {

			const customer = getCustomer();

			const requiredFields = context.fields.filter(({ required }) => required);

			for (const { key, translationKey } of requiredFields) {

				if (!get(customer, key, null)) {
					Thunder.notify('error', context.m(`${translationKey}Required`));
					return false;
				}

			}

			return true;

		}

	};

	return implementation;

};