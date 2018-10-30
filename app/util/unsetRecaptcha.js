module.exports = function(data) {

	if (!data) return null;

	const recaptchaField = 'g-recaptcha-response';
	const response = data[recaptchaField];

	delete data[recaptchaField];

	return response || null;

};