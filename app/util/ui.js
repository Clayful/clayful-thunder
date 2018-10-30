module.exports = function(name) {

	return this.uis[name] ? this.uis[name]() : '';

};