module.exports = Thunder => {

	const implementation = {
		name: 'customer-delete-account'
	};

	implementation.options = () => ({

		confirmOnDelete: Thunder.options.confirmation.customerDelete, // Whether to confirm before deleting

		onDelete: function($container, context) {

			Thunder.notify('success', context.m('deleteSuccess'));

			Thunder.plugins.redirect(Thunder.options.root);
		}

	});

	implementation.init = function(context) {

		const $container = $(this);
		const $form = $(this).find('.thunder--customer-delete-account-form');
		const $button = $form.find('.thunder--delete-account');
		const buttonSpinner = Thunder.util.makeAsyncButton($button);

		$button.on('click', function(event) {

			event.preventDefault();

			if (!context.options.confirmOnDelete) {
				return deleteCustomer();
			}

			return Thunder.plugins.confirmation(
				context.m('deleteConfirm'),
				() => deleteCustomer(),
				() => buttonSpinner.done()
			);

		});

		function deleteCustomer() {

			const errors = {
				default: context.m(`deleteFailed`)
			};

			Thunder.request({
				method: 'DELETE',
				url:    '/v1/me',
			}).then(() => {

				buttonSpinner.done();

				Thunder.logout();

				Thunder.execute(
					context.options.onDelete,
					$container,
					context
				);

			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors,
				err => buttonSpinner.done()
			));

		}

	};

	return implementation;

};