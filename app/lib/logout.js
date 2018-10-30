module.exports = function() {

	const storage = this.plugins.credentialStorage;

	storage.removeItem(this.options.authStorage.customer);

	this.header();

};