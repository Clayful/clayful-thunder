module.exports = function() {

	if (!this.options.header) {
		return null;
	}

	const $headerNav = $('#thunder--header-navigation');

	if (!$headerNav.length) {

		const actions = this.options.header.actions;

		$('body').prepend(this.uis['header-navigation']());
		$('body').on('click', '#thunder--header-navigation [data-component]', function(e) {
			e.preventDefault();
			actions[$(this).data('component')]();
		});

	} else {

		$headerNav.replaceWith(this.uis['header-navigation']());

	}

};