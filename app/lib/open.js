module.exports = function(componentName, options, callback = () => {}) {

	const Thunder = this;

	options = options || {};

	callback = typeof options === 'function' ? options : callback;

	if (this.overlay.background.hasClass('hidden')) {
		// Removes a 'hidden' class first
		this.overlay.background.removeClass('hidden');
		this.overlay.container.removeClass('hidden');
	}
	// hide body scroll
	$('html, body').addClass('thunder--overflow-fix');

	// Mark current view
	$.extend(true, options, {
		view: {
			component: componentName,
			cursor:    this.cursor,
		}
	});

	this.render(this.overlay.body, componentName, options, function(err, context) {

		if (err) {
			return callback.call($(this), err);
		}

		return callback.call($(this), err, context);

	});

	return this;

};