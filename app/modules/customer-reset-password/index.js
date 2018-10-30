module.exports = Thunder => {

	const implementation = {
		name: 'customer-reset-password'
	};

	implementation.options = () => ({
		customer:  'customer',
		secret:    'secret',
		input:     'query',      // 'query' or 'attribute'
		expiresIn: 60 * 60 * 24, // 24 hours
		onEmailRequest: function($container, context) {

			Thunder.notify('success', context.m('requestEmailSuccess'));
		},
		onPasswordReset: function($container, context) {

			Thunder.notify('success', context.m('setPasswordSuccess'));

			Thunder.render($container, 'customer-login');
		},
	});

	implementation.pre = function(context, callback) {

		if (context.options.input === 'query') {

			const query = Thunder.util.urlQuery();
			const customerField = context.options.customer;
			const secretField = context.options.secret;

			if (query[customerField] &&
				query[secretField]) {

				context.customer = query[customerField];
				context.secret = query[secretField];
			}

		}

		if (context.options.input === 'attribute') {

			context.customer = context.options.customer;
			context.secret = context.options.secret;
		}

		context.type = context.customer &&
						context.secret ?
							'reset-password' :
							'request-email';

		return callback(null, context);

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $form = $(this).find('.thunder--reset-password-form');

		if (context.type === 'request-email') {

			const $requestEmail = $form.find('.thunder--request-email');
			const $goToCustomerLogin = $(this).find('.thunder--go-to-customer-login');
			const requestEmailSpinner = Thunder.util.makeAsyncButton($requestEmail);

			Thunder.util.bindBackButton($goToCustomerLogin, context);

			Thunder.util.makeRecaptcha(implementation.name, $requestEmail, function(token, resetRecaptcha) {

				const data = $.extend(Thunder.util.userIdOrEmail(
					Thunder.util.formToJSON($form.serializeArray())
				), {
					expiresIn: context.options.expiresIn,
					scope:     'reset-password'
				});

				const resetState = () => {
					requestEmailSpinner.done();
					return resetRecaptcha && resetRecaptcha();
				};

				const errors = {
					'not-existing-customer': context.m('notExistingCustomer'),
					'email-required':        context.m('customerWithoutEmail'),
					default:                 context.m('requestEmailFailed')
				};

				Thunder.request({
					method:  'POST',
					url:     '/v1/customers/verifications/emails',
					data:    data,
				}).then(() => {

					Thunder.execute(
						context.options.onEmailRequest,
						$container,
						context
					);

					return resetState();

				}, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors,
					err => resetState()
				));

			});

		}

		if (context.type === 'reset-password') {

			const $resetPassword = $form.find('.thunder--reset-password');
			const resetPasswordSpinner = Thunder.util.makeAsyncButton($resetPassword);

			Thunder.util.makeRecaptcha(implementation.name, $resetPassword, function(token, resetRecaptcha) {

				const data = $.extend(Thunder.util.formToJSON($form.serializeArray()), {
					secret: context.secret
				});

				const resetState = () => {
					resetPasswordSpinner.done();
					return resetRecaptcha && resetRecaptcha();
				};

				const errors = {
					default: context.m('setPasswordFailed')
				};

				Thunder.request({
					method:    'PUT',
					url:       `/v1/customers/${context.customer}/password`,
					data:      data,
					recaptcha: token,
				}).then(() => {

					Thunder.execute(
						context.options.onPasswordReset,
						$container,
						context
					);

					return resetState();

				}, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors,
					err => resetState()
				));

			});

		}

	};

	return implementation;

};