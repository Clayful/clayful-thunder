module.exports = function(number = 0, precision = 0) {

	const n = Math.pow(10, precision);

	return Math.round(number * n) / n;

};