module.exports = function() {

	const { action, customer, token } = this.util.urlQuery();

	if (!action) {
		return null;
	}

	if (action && customer && token) {

		const storage = this.plugins.credentialStorage;

		storage.setItem(this.options.authStorage.customer, token);

		// Re-render header
		this.header();
	}

	const query = this.util.urlQuery();
	const payload = {};

	[
		'action',
		'customer',
		'token',
		'error',
	].forEach(field => payload[field] = query[field]);

	return payload;

};