module.exports = Thunder => {

	const implementation = {
		name: 'customer-login'
	};

	implementation.options = () => ({

		socialApps: Thunder.options.socialApps,

		onLogin: function($container, context) {

			Thunder.notify('success', context.m('loginSuccess'));

			Thunder.plugins.redirect(Thunder.options.root);
		},

		onSocialLogin: function($container, context, data) {

			Thunder.notify('success', context.m('loginSuccess'));

			Thunder.plugins.redirect(Thunder.options.root);
		}

	});

	implementation.pre = function(context, callback) {

		context.social = () => Thunder.uis['social-login']({
			type:    'login',
			vendors: context.options.socialApps
		});

		return callback(null, context);

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $form = $(this).find('.thunder--login-form');
		const $button = $form.find('.thunder--login-customer');
		const $goToResetPassword = $(this).find('.thunder--go-to-reset-password');
		const buttonSpinner = Thunder.util.makeAsyncButton($button);

		Thunder.util.bindSocialApps($container);

		const socialData = Thunder.util.handleSocialLogin();

		if (socialData) {

			Thunder.execute(
				context.options.onSocialLogin,
				$container,
				context,
				socialData
			);
		}

		$goToResetPassword.on('click', () => {
			return Thunder.render($container, 'customer-reset-password', {
				back: {
					$container: $container,
					component:  implementation.name,
					options:    context.options
				}
			});
		});

		Thunder.util.makeRecaptcha(implementation.name, $button, function(token, resetRecaptcha) {

			const data = Thunder.util.userIdOrEmail(
				Thunder.util.formToJSON($form.serializeArray())
			);

			const resetState = () => {
				buttonSpinner.done();
				return resetRecaptcha && resetRecaptcha();
			};

			const errors = {
				'not-existing-customer': context.m('notExistingCustomer'),
				'invalid-password':      context.m('invalidPassword'),
				default:                 context.m('loginFailed')
			};

			Thunder.request({
				method: 'POST',
				url:    '/v1/customers/auth',
				data:   data,
			}).then(data => {

				const storage = Thunder.plugins.credentialStorage;

				storage.setItem(Thunder.options.authStorage.customer, data.token);

				Thunder.header();

				Thunder.execute(
					context.options.onLogin,
					$container,
					context
				);

				return resetState();

			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors,
				() => resetState()
			));

		});

	};

	return implementation;

};