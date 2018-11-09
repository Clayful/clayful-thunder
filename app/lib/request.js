module.exports = function(Thunder) {

	const request = function(requestOptions) {

		let query = $.param(requestOptions.query || {});

		query = query ? ('?' + query) : query;

		requestOptions.url = Thunder.options.baseURL + requestOptions.url + query;

		const recaptcha = requestOptions.recaptcha;

		delete requestOptions.query;
		delete requestOptions.recaptcha;

		const req = $.extend(true, {
			crossDomain: true,
			headers:     $.extend(
				request.getRequestHeaders(Thunder),
				recaptcha ? { 'Recaptcha-Response': recaptcha } : {}
			),
			xhrFields: {
				withCredentials: true
			},
			converters: {
				'text json': data => $.parseJSON(data || 'null')
			}
		}, requestOptions);

		if (req.data) {

			const recaptcha = Thunder.util.unsetRecaptcha(req.data);

			if (recaptcha) {
				req.headers['reCAPTCHA-Response'] = recaptcha;
			}

			req.data = JSON.stringify(req.data);
			req.dataType = 'json';
			req.contentType = 'application/json; charset=utf-8';
		}

		return $.ajax(req);

	};

	request.defaultHeaders = {
		'Clayful-SDK': 'clayful-thunder'
	};

	request.setDefaultHeader = (key, value) => {
		request.defaultHeaders[key] = value;
	};

	request.getRequestHeaders = () => {

		const storage = Thunder.plugins.credentialStorage;

		// 1. If a customer is logged-in, send a customer token.
		// 2. If an order token or a subscription token exists, send the token.
		// 3. Or else, simply do not set `Authorization-Customer` header
		const customerToken =
				storage.getItem(Thunder.options.authStorage.customer) ||
				storage.getItem(Thunder.options.authStorage.order);

		return $.extend(
			{},
			request.defaultHeaders,
			customerToken ? {
				'Authorization-Customer': customerToken
			} : {}
		);

	};

	return request;

};