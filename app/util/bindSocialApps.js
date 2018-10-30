module.exports = function($container) {

	const Thunder = this;

	const $socialButton = $container.find('[data-social-app]');

	$socialButton.on('click', function() {

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