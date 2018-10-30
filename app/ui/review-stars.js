module.exports = function(starred = 0) {

	const stars = [];

	for (let i = 0; i < starred - 1; i++) {
		stars.push(1);
	}

	const rest = starred - stars.length;

	if (rest > 0) {
		stars.push(rest);
	}

	return [
		`<span class="thunder--review-stars" data-rating="${starred}">`,
		...Array.apply(null, { length: 5 }).map((el, i) => {
			return starred === 0 ?
					`<img src="${this.ui(star(-1))()}">` :
					`<img src="${this.ui(star(stars[i] || 0))()}">`;
		}),
		`</span>`,
	].join('');

};

function star(n = 0) {

	if (n === -1) return 'hallow-star';
	if (n === 0) return 'empty-star';
	if (n === 1) return 'filled-star';

	return n >= 0.5 ?
		'half-filled-star' :
		'empty-star';

}