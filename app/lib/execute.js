module.exports = function(fn, ...args) {

	fn = typeof fn === 'string' ?
			this.methods[fn] :
			fn;

	if (!fn) return;

	return fn(...args);

};