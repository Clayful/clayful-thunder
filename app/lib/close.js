module.exports = function() {

	// Empty the contents and add a 'hidden' class
	this.overlay.container.addClass('hidden');
	this.overlay.background.addClass('hidden');

	this.overlay.body.html('');

	// show body scroll
	$('html, body').removeAttr('style');

	return this;

};