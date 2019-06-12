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
			this.notify('success', this.polyglot.t('general.copySucceeded'));
		} catch (err) {
			this.notify('error', this.polyglot.t('general.copyFailed'));
		}

		$temp.remove();

		return result;
};