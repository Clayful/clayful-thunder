module.exports = function(options) {

	const language = options.language;
	const currency = options.currency;
	const timezone = options.timezone;
	const debugLanguage = options.debugLanguage;

	this.options.language = language;
	this.options.currency = currency;
	this.options.timezone = timezone;

	this.polyglot.locale(this.options.language);

	if (language) this.request.setDefaultHeader('Accept-Language', language);
	if (currency) this.request.setDefaultHeader('Accept-Currency', currency);
	if (timezone) this.request.setDefaultHeader('Accept-Time-Zone', timezone);
	if (debugLanguage) this.request.setDefaultHeader('Accept-Debug-Language', debugLanguage);

	return this;

};