module.exports = function(scope, listener) {

	const index = this.listeners[scope].indexOf(listener);

	if (index === -1) {

		return this;
	}

	this.listeners[scope].splice(index, 1);

	return this;

};