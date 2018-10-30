const camelCase = require('lodash.camelcase');

module.exports = Thunder => {

	const implementation = {
		name: 'customer-update-credential'
	};

	implementation.options = () => ({

		field: null, // 'userId', 'email', 'password'

		onUpdate: function($container, context) {

			Thunder.notify('success', context.m('updateSuccess'));
		},
		onUpdateCustomer: function($container, context, field) {

			Thunder.render($container, 'customer-update');
		}

	});

	implementation.init = function(context) {

		const $container = $(this);
		const $updateCustomer = $(this).find('.thunder--update-customer');
		const $form = $(this).find('.thunder--credential-form');
		const $button = $form.find('.thunder--update-credential');
		const buttonSpinner = Thunder.util.makeAsyncButton($button);

		$updateCustomer.on('click', () => Thunder.execute(
			context.options.onUpdateCustomer,
			$container,
			context
		));

		Thunder.util.makeRecaptcha(implementation.name, $button, function(token, resetRecaptcha) {

			const data = Thunder.util.formToJSON($form.serializeArray());

			// For customers with social registrations
			data.password = data.password || '';

			const resetState = () => {
				buttonSpinner.done();
				return resetRecaptcha && resetRecaptcha();
			};

			const errors = {
				'invalid-password':   context.m('invalidPassword'),
				'duplicated-user-id': context.m('duplicatedUserId'),
				'duplicated-email':   context.m('duplicatedEmail'),
				default:              context.m('updateFailed'),
				validation: err => {
					const path = err.validation.source.split('.');
					const field = path[path.length - 1];

					return context.m(camelCase(['invalidNew', field]));
				},
			};

			return Thunder.request({
				method: 'PUT',
				url:    '/v1/me/credentials',
				data:   data,
			}).then(() => {

				Thunder.execute(
					context.options.onUpdate,
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

	};

	return implementation;

};