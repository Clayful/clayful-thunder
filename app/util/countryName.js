module.exports = function(code = null, name = '') {

	if (!code || !name) return '';

	const flag =
		code.toUpperCase()
			.replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));

	return [flag, name].filter(v => v).join(' ');

};