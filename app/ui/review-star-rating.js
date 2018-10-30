module.exports = function(defaultRating = 5) {

	const ratings = [1, 2, 3, 4, 5];

	return `
	<select name="rating">${ratings.map(r => `
		<option value="${r}" ${defaultRating === r ? 'selected' : ''}>${'⭐'.repeat(r)}</option>
	`.trim()).join('')}
	</select>
	`.trim();

};