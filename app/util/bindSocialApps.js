module.exports = function($container, validate = (() => true)) {

	const Thunder = this;

	const $socialButton = $container.find('[data-social-app]');

	$socialButton.on('click', function() {

		if (!validate()) {
			return;
		}

		const vendor = $(this).data('socialApp');

		Thunder.request({
			method: 'POST',
			url:    `/v1/customers/auth/${vendor}`
		}).done(data => {

			location.replace(data.redirect);

		}).fail((res, status) => {

			// TODO: Error handling

		});

	});

};