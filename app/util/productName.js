module.exports = function(product, variant) {

	return [].concat(
		product.name,
		variant && variant.types.length ? this.util.variantName(variant) : []
	).join(' / ');

};