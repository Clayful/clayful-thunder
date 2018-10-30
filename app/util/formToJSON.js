const set = require('lodash.set');

module.exports = function(serialized) {

	const data = {};

	serialized.forEach(d => set(data, d.name, d.value || null));

	return data;

};