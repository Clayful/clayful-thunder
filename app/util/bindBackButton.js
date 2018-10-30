const get = require('lodash.get');

module.exports = function($button, context) {

	const history = get(context, 'options.back');

	if (!$button || !history) return;

	const {
		$container,
		component,
		options,
	} = history;

	$button.on('click', event => {

		if (event) event.preventDefault();

		return this.render($container, component, options || {});

	});

};