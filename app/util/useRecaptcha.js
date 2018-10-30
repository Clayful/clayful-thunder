module.exports = function(moduleName) {

	return this.options.recaptcha.sitekey &&
			this.options.recaptcha.modules.some(m => m === moduleName);
};