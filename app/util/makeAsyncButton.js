module.exports = function($button, options) {

	options = options || {};

	const {
		bind = true
	} = options;

	const original = $button.html();

	const run = () => $button.html(this.ui('button-spinner'));
	const done = () => $button.html(original);

	if (bind) {
		$button.on('click', run);
	}

	return { run, done };

};