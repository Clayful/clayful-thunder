module.exports = function(tags = [], message) {

	const type = tags.indexOf('error') === -1 ?
					'log' :
					'error';

	return console[type](`[${ tags.join(',') }] Thunder: ${ message }`);

};