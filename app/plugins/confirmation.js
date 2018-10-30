module.exports = function(message, ok, no = () => {}) {

	return confirm(`🔔 ${message}`) ? ok() : no();

};