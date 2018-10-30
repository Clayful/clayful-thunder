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
		name: 'customer-update'
	};

	implementation.options = () => ({

		fields:          Thunder.options.customerUpdateFields,
		birthdateFormat: Thunder.options.dateInputFormat,

		onUpdate: function($container, context, customer) {

			return Thunder.notify('success', context.m('updateSuccess'));
		},
		onChangeCredential: function($container, context, field) {

			return Thunder.render($container, 'customer-update-credential', { field });
		}

	});

	implementation.pre = function(context, callback) {

		const birthOptions = {
			YYYY: { key: 'birthYear', translationKey: 'year', tester: /^\d{4}$/ },
			MM:   { key: 'birthMonth', translationKey: 'month', tester: /^\d{1,2}$/ },
			DD:   { key: 'birthDate', translationKey: 'date', tester: /^\d{1,2}$/ }
		};

		const hasBirthDate = context.options.fields.indexOf('birthdate') >= 0;
		const birthdateFormats = context.options.birthdateFormat.split('-');

		context.fields = Thunder.util.parseArrayString(context.options.fields).map(field => {

			const [key, required] = field.split(':');

			return {
				required:       required === 'required',
				key:            key,
				translationKey: translationKey[key] || key
			};

		});

		context.birthdateFields = hasBirthDate ? birthdateFormats.map((format, i) => $.extend({
			last: i === birthdateFormats.length - 1
		}, birthOptions[format])) : [];

		const errors = {
			default: context.m('customerReadFailed')
		};

		return Thunder.request({
			method: 'GET',
			url:    '/v1/me',
			query:  {
				fields: [
					'avatar',
					'userId',
					'email',
					'alias',
					'name.first',
					'name.last',
					'name.full',
					'mobile',
					'phone',
					'gender',
					'birthdate',
					'country',
				].join(',')
			}
		}).then(data => {
			return callback(null, set(context, 'customer', data));
		}, err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $backToCheckout = $(this).find('.thunder--back-to-checkout');
		const $changeCredential = $(this).find('[data-change-credential]');
		const $avatarForm = $(this).find('.thunder--customer-avatar-form');
		const $avatar = $avatarForm.find('.thunder--customer-avatar');
		const $updateForm = $(this).find('.thunder--customer-update-form');
		const $button = $updateForm.find('.thunder--update-customer');
		const buttonSpinner = Thunder.util.makeAsyncButton($button, { bind: false });

		const fields = [
			...context.fields,
			...context.birthdateFields
		]
		.filter(({ key }) => key !== 'birthdate')
		.map(({ key }) => ({
			key:   key,
			$input: $updateForm.find(`[name="${key}"]`),
		}));

		customerToForm(context.customer);

		Thunder.util.imageUploader(
			$avatarForm,
			image => Thunder.request({
				method: 'PUT',
				url:    '/v1/me',
				data:   { avatar: image._id }
			}).then(() => {
				$avatar.attr('src', Thunder.util.imageURL(image, 120, 120));
				return Thunder.notify('success', context.m('avatarUploadSuccess'));
			}, err => {
				return Thunder.notify('error', context.m('avatarUploadFailed'));
			}),
			() => Thunder.notify('error', context.m('avatarUploadFailed'))
		);

		Thunder.util.bindBackButton($backToCheckout, context);

		$changeCredential.on('click', function() {

			Thunder.execute(
				context.options.onChangeCredential,
				$container,
				context,
				$(this).data('changeCredential')
			);

		});

		Thunder.util.makeRecaptcha({
			componentName: implementation.name,
			button:        $button,
			validate:      validateCustomer,
			callback:      function(token, resetRecaptcha) {

				buttonSpinner.run();

				const resetState = () => {
					buttonSpinner.done();
					return resetRecaptcha && resetRecaptcha();
				};

				const errors = {
					default: context.m('updateFailed'),

					validation: err => {

						const [, ...path] = err.validation.source.split('.');
						const field = path.join('.');

						return context.m(camelCase(['invalid', translationKey[field] || field]));
					},
				};

				return Thunder.request({
					method: 'PUT',
					url:    '/v1/me',
					data:   formToCustomer(),
				}).then(customer => {

					customerToForm(customer);

					Thunder.execute(
						context.options.onUpdate,
						$container,
						context,
						customer
					);

					return resetState();

				}, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors,
					err => resetState()
				));

			}
		});

		function normalizeBirthdate(data) {

			const birthFields = [
				'birthYear',
				'birthMonth',
				'birthDate',
			];

			if (birthFields.every(field => data[field])) {

				data.birthdate = new Date(
					data.birthYear,
					data.birthMonth - 1,
					data.birthDate
				);

			} else {
				data.birthdate = null;
			}

			birthFields.forEach(field => delete data[field]);

			return data;

		}

		function formToCustomer() {

			return normalizeBirthdate(Thunder.util.formToJSON($updateForm.serializeArray()));
		}

		function customerToForm(customer) {

			const birthdate = customer.birthdate ?
								new Date(customer.birthdate.raw || customer.birthdate) :
								null;

			delete customer.birthdate;

			if (birthdate) {
				$.extend(customer, {
					birthYear:  birthdate.getFullYear(),
					birthMonth: birthdate.getMonth() + 1,
					birthDate:  birthdate.getDate(),
				});
			}

			fields.forEach(({ key, $input }) => {

				$input.val(get(customer, key) || null);

			});

		}

		function validateCustomer() {

			const customer = formToCustomer();

			const requiredFields = context.fields.filter(field => field.required);

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