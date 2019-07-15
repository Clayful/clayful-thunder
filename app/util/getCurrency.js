module.exports = function(code) {

	if (!code) {
		return deferred.reject(new Error('Currency code is required.'));
	}

	code = code.toUpperCase();

	const deferred = $.Deferred();
	const key = `__currency:${code}__`;
	const saved = sessionStorage.getItem(key);

	if (saved) {

		return deferred.resolve(JSON.parse(saved));

	} else {

		Thunder.request({
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
			sessionStorage.setItem(key, JSON.stringify(res[0]));
			return deferred.resolve(res[0]);
		});
	}

	return deferred.promise();
};