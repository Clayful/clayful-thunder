module.exports = function($container) {

	$container.find('.thunder--quantity').each(function() {

		const min = parseInt($(this).attr('min') || 0);
		const max = parseInt($(this).attr('max') || 100);

		const $wrapper = $(`
			<span class="thunder--quantity-wrapper"></span>
		`);

		$(this).wrap($wrapper);

		const $dec = $(`<span class="thunder--quantity-action" data-type="dec">-</span>`);
		const $inc = $(`<span class="thunder--quantity-action" data-type="inc">+</span>`);

		$dec.insertBefore($(this));
		$inc.insertAfter($(this));

		$dec.on('click', () => {

			const oldVal = parseInt($(this).val());
			const newVal = oldVal - 1;

			if (oldVal === min) {
				return;
			}

			$(this).val(newVal);
			$(this).trigger('change');
		});

		$inc.on('click', () => {

			const oldVal = parseInt($(this).val());
			const newVal = oldVal + 1;

			if (oldVal === max) {
				return;
			}

			$(this).val(newVal);
			$(this).trigger('change');
		});

	});

};