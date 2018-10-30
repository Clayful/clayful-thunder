module.exports = function(client) {

	this.request.setDefaultHeader('Authorization', `Bearer ${client}`);

	return this;

};