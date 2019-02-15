module.exports = function(value) {

	return typeof value === 'string' ?
			value.split(',').filter(v => v) :
			value;

};