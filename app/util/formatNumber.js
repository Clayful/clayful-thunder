module.exports = function(number, currency = {}) {

	if (typeof number !== 'number') {

		return '';
	}

	const { precision, delimiter = {} } = currency;
	const { thousands = '', decimal = '.' } = delimiter;

	if (typeof precision === 'number') {

		number = this.util.toPrecision(number, precision);
	}

	let [a, b = ''] = String(number).split('.');

	const reversedArray = a.split('').reverse();

	const segments = [];

	while (reversedArray.length) {

		segments.unshift(reversedArray.splice(0, 3).reverse().join(''));

	}

	if (precision) {

		const diff = precision - b.length;

		for (let i = 0; i < diff; i++) {
			b += '0';
		}

	}

	return [segments.join(thousands), b].join(b ? decimal : '');

};