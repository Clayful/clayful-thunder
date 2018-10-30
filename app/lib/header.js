module.exports = function() {

	if (!this.options.header) {
		return null;
	}

	const $headerNav = $('#thunder--header-navigation');

	if (!$headerNav.length) {
		$('body').prepend(this.uis['header-navigation']());
	} else {
		$headerNav.replaceWith(this.uis['header-navigation']());
	}

};