module.exports = function() {

	// Since SPA(Single Page App) might use hashbang(/#/?hello=world) in its url,
	// `location.href` is being used to find query string.
	const [, search] = location.href.split('?');

	if (!search) return {};

	return JSON.parse(
		'{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
		(key, value) => key === '' ? value : decodeURIComponent(value)
	);

};