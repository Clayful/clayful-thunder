const parseQueryString = require('./parseQueryString.js');

module.exports = function() {

	// Since SPA(Single Page App) might use hashbang(/#/?hello=world) in its url,
	// `location.href` is being used to find query string.
	const [, queryAfter = ''] = location.href.split('?');

	// Remove URL hash
	const [search] = queryAfter.split('#');

	if (!search) return {};

	return parseQueryString(search);

};