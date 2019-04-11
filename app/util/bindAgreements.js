module.exports = ({
	$terms,
	agreements
}) => {

	const $all = $terms.filter('[data-agreement-scope="all"]');
	const $allCheck = $all.find('input[type="checkbox"]');

	$terms = $terms.filter('[data-agreement-scope!="all"]');
	const $termsChecks = $terms.find('input[type="checkbox"]');

	const $requiredTermsChecks = $terms.find('input[type="checkbox"][required]');

	$termsChecks.on('change', function() {

		$allCheck.prop('checked', $termsChecks.map(function() {
			return $(this).is(':checked');
		}).get().every(v => v));

	});

	$allCheck.on('change', function() {

		const checked = $allCheck.is(':checked');

		$termsChecks.each(function() {
			$(this).prop('checked', checked);
		});

	});

	$terms.find('a').filter(':not([href])').on('click', function(e) {

		e.preventDefault();

		const scope = $(this).parents('[data-agreement-scope]').data('agreementScope');
		const $overlay = $(Thunder.ui('text-box-overlay')(agreements[scope].text));
		const $close = $overlay.find('.thunder--text-box-overlay-close');

		$('body').append($overlay);

		$close.on('click', function() {
			$overlay.remove();
		});

	});

	return () => {

		if (!$requiredTermsChecks.length) {
			return true;
		}

		for (let i = 0; i < $requiredTermsChecks.length; i++) {

			const $term = $requiredTermsChecks.eq(i);

			if (!$term.is(':checked')) {

				const scope = $term.parents('[data-agreement-scope]').data('agreementScope');

				Thunder.notify('error', agreements[scope].error);

				return false;
			}
		}
		return true;
	};

};