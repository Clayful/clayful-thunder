module.exports = Thunder => {

	const implementation = {
		name: 'search-purchase'
	};

	implementation.options = () => ({
		type: 'order', // 'order' || 'subscription'

		onSearch: function($container, context, subject) {

			const type = context.options.type;

			Thunder.render($container, `${type}-detail`, {
				[type]: subject
			});
		}
	});

	implementation.pre = function(context, callback) {

		const translationKeys = {
			'name.first': 'firstName',
			'name.last':  'lastName',
			'name.full':  'fullName',
		};

		context.authFields = Thunder.options.orderAuthFields.map(field => ({
			key: field,
			translationKey: translationKeys[field] || field,
		}));

		context.showLinks = Object.keys(Thunder.options.paymentMethods).reduce((o, scope) => {

			const paymentMethods = Thunder.options.paymentMethods[scope];

			o[scope] = paymentMethods && paymentMethods.length;

			return o;

		}, {});

		return callback(null, context);

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $form = $(this).find('.thunder--search-purchase-form');
		const $button = $form.find('.thunder--search-purchase');
		const $goToSearch = $(this).find('.thunder--go-to-search-purchase');
		const buttonSpinner = Thunder.util.makeAsyncButton($button);

		$goToSearch.on('click', goToSearch);

		Thunder.util.makeRecaptcha(implementation.name, $button, function(token, resetRecaptcha) {

			const type = context.options.type;
			const data = Thunder.util.formToJSON($form.serializeArray());
			const subject = data.subject;

			delete data.subject;

			const resetState = () => {
				buttonSpinner.done();
				return resetRecaptcha && resetRecaptcha();
			};

			const errors = {
				'not-existing-order':        context.m('notExistingOrder'),
				'not-existing-subscription': context.m('notExistingSubscription'),
				'invalid-customer-info':     context.m('invalidCustomerInfo'),
				default:                     context.m('searchFailed')
			};

			return Thunder.request({
				method: 'POST',
				url:    `/v1/${type}s/${subject}/auth`,
				data:   data,
			}).then(authResult => {

				const storage = Thunder.plugins.credentialStorage;
				const token = authResult.token;

				// Set auth token in the storage.
				storage.setItem(Thunder.options.authStorage.order, token);

				Thunder.execute(
					context.options.onSearch,
					$container,
					context,
					subject
				);

				return resetState();

			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors,
				() => resetState()
			));

		});

		function goToSearch() {

			return Thunder.render($container, 'search-purchase', {
				type: $(this).data('type')
			});

		}

	};

	return implementation;

};