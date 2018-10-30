module.exports = (text, length) => {

	if (typeof length !== 'number') {
		return text;
	}

	// Remove HTML tags
	text = $(`<div>${text || ''}</div>`).text();

	const reduced = text
					.replace(/\s+/g, ' ') // Replace all empty spaced to one space
					.trim()
					.slice(0, length)
					.trim();

	return text.length <= length ?
			reduced :
			`${reduced}...`;
};