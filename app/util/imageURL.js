module.exports = function(image, width, height) {

	if (!image) return '';

	let dimension = [];

	width = width ? 'width=' + width : '';
	height = height ? 'height=' + height : '';

	if (width)  dimension.push(width);
	if (height) dimension.push(height);

	dimension = dimension.length ? '?' + dimension.join('&') : '';

	return image.url + dimension;

};