module.exports = Thunder => {

	const implementation = {
		name: 'customer-verification'
	};

	implementation.options = () => ({
		customer:  'customer',
		secret:    'secret',
		input:     'query',      // 'query' or 'attribute'
		expiresIn: 60 * 60 * 24, // 24 hours

		onEmailRequest: function($container, context) {

			Thunder.notify('success', context.m('requestEmailSuccess'));
		},
		onVerification: function($container, context) {

			Thunder.notify('success', context.m('verificationSuccess'));
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
							'verification' :
							'request-email';

		return callback(null, context);

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $form = $(this).find('.thunder--reset-password-form');

		if (context.type === 'request-email') {

			const $requestEmail = $form.find('.thunder--request-email');
			const requestEmailSpinner = Thunder.util.makeAsyncButton($requestEmail);

			Thunder.util.makeRecaptcha(implementation.name, $requestEmail, function(token, resetRecaptcha) {

				const data = $.extend(Thunder.util.userIdOrEmail(
					Thunder.util.formToJSON($form.serializeArray())
				), {
					expiresIn: context.options.expiresIn,
					scope:     'verification'
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

		if (context.type === 'verification') {

			const $finishVerification = $form.find('.thunder--finish-verification');
			const finishVerificationSpinner = Thunder.util.makeAsyncButton($finishVerification);

			Thunder.util.makeRecaptcha(implementation.name, $finishVerification, function(token, resetRecaptcha) {

				const data = {
					secret: context.secret
				};

				const resetState = () => {
					finishVerificationSpinner.done();
					return resetRecaptcha && resetRecaptcha();
				};

				const errors = {
					default: context.m('verificationFailed')
				};

				Thunder.request({
					method:    'POST',
					url:       `/v1/customers/${context.customer}/verified`,
					data:      data,
					recaptcha: token,
				}).then(() => {

					Thunder.execute(
						context.options.onVerification,
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