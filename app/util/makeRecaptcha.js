module.exports = function(componentName, $button, callback) {

	let validate = () => true;

	if (typeof componentName === 'object') {

		const options = componentName;

		componentName = options.componentName;
		$button = options.button;
		validate = options.validate || validate;
		callback = options.callback;
	}

	const signature = 'thunder--recaptcha-handler';

	if (!$button.hasClass(signature)) {

		$button.addClass(signature);

		$button.data('execute', ($button.data('execute') || []).concat(callback));

		$button.on('click', function(event) {

			event.preventDefault();

			if (!validate()) return;

			$button.data('execute').forEach(execute => execute());
		});

	}

	if (!this.util.useRecaptcha(componentName)) {
		return $button.data('execute');
	}

	const grecaptcha = window.grecaptcha;

	if (!grecaptcha || !grecaptcha.render) {

		this.options.recaptcha.queue.push({
			componentName,
			$button,
			fn: callback
		});

		return $button.data('execute');
	}

	const $challenge = $('<div class="g-recaptcha"></div>');

	$button.before($challenge);

	const challenge = $challenge.get(0);

	const id = grecaptcha.render(challenge, {
		sitekey:  this.options.recaptcha.sitekey,
		size:     'invisible',
		badge:    'bottomright',
		isolated: true,
		callback: token => callback(token, () => grecaptcha.reset(id)),
		'expired-callback': err => {
			// TODO: Implement callback
		},
		'error-callback': err => {
			// TODO: Implement callback
		},
	});

	$challenge.prop('id', 'g-recaptcha-' + id);

	const callbacks = ($button.data('execute') || [])
						.concat(() => grecaptcha.execute(id))
						.filter(fn => fn !== callback); // Remove original callback

	$button.data('execute', callbacks);

	return $button.data('execute');

};