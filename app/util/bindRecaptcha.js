module.exports = function() {

	this.options.recaptcha.queue.forEach(option => {

		this.util.makeRecaptcha(option.componentName, option.$button, option.fn);

	});

	this.options.recaptcha.queue = [];

};