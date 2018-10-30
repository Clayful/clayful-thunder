module.exports = function(variant) {

	return variant.types
			.map(type => `${type.option.name} - ${type.variation.value}`)
			.join(', ');

};