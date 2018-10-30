module.exports = function(date, timeToCompare = Date.now()) {

	return new Date(date).valueOf() - timeToCompare < 0;

};