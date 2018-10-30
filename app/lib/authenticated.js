module.exports = function(scope = 'customer') {

	const storage = this.plugins.credentialStorage;

	// Customer case
	if (scope === 'customer') {

		const storageKey = this.options.authStorage.customer;
		const token = storage.getItem(storageKey);

		if (!token) {
			return false;
		}

		if (isTokenExpired(token)) {
			// If the token expired, log out the customer.
			this.logout();
			return false;
		}

		return parseToken(token);
	}

	// Order or Subscription case
	if (scope === 'order') {

		const storageKey = this.options.authStorage.order;
		const token = storage.getItem(storageKey);

		if (!token) {
			return false;
		}

		if (isTokenExpired(token)) {
			// If the token expired, unset the token from the storage.
			storage.removeItem(this.options.authStorage.order);
			return false;
		}

		return parseToken(token);

	}

};

function parseToken(token) {

	const parts = token.split('.');
	const data = JSON.parse(atob(parts[1]));

	return data;

}

function isTokenExpired(token) {

	const expiresAt = parseToken(token).exp * 1000;

	return expiresAt - Date.now() <= 0;

}