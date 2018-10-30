module.exports = function(scope, listener) {

	this.listeners[scope].push(listener);

	return this;

};