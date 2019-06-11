module.exports = function(elem) {

		const $temp = $('<input>');

		$temp.css({
			position: 'absolute',
			left:     '-9999px',
			top:      '0',
		});

		$('body').append($temp);

		$temp.val($(elem).text().trim()).select();

		let result = false;

		try {
			result = document.execCommand('copy');
			Thunder.notify('success', Thunder.polyglot.t('general.copySucceeded'));
		} catch (err) {
			Thunder.notify('error', Thunder.polyglot.t('general.copyFailed'));
		}

		$temp.remove();

		return result;
};