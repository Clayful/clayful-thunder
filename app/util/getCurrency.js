module.exports = function(code) {
	const deferred = $.Deferred();

	if (!code) return deferred.reject('code is required.');

	code = code.toUpperCase();

	if (sessionStorage.getItem(`__currency:${code}__`)) {
		deferred.resolve(JSON.parse(sessionStorage.getItem(`__currency:${code}__`)));
	}

	if (!sessionStorage.getItem(`__currency:${code}__`)) {

		window.Thunder.request({
			method: 'GET',
			url: '/v1/currencies',
			query: {
				raw: true,
				fields: [
					'code',
					'delimiter',
					'format',
					'precision',
					'symbol',
				].join(','),
				code: code,
			}
		}).then(res => {
			sessionStorage.setItem(`__currency:${code}__`, JSON.stringify(res[0]));
			return deferred.resolve(res[0]);
		});
	}

	return deferred.promise();
};