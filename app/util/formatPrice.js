module.exports = function(number, currency = {}) {

	const formattedNumber = this.util.formatNumber(number, currency);

	if (!formattedNumber) {

		return '';
	}

	const { symbol = '', format = '{price}' } = currency;

	return format
			.replace('{symbol}', symbol)
			.replace('{price}', formattedNumber);

};