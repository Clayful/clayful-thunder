module.exports = function(scope, binder, ...args) {

	this.listeners[scope].forEach(callback => {
		return binder ?
			callback.call(binder, ...args) :
			callback(...args);
	});

	return this;

};