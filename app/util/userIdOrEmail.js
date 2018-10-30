module.exports = function(data) {

	if (!data.userIdOrEmail) {
		return data;
	}

	if (data.userIdOrEmail.indexOf('@') > 0) {
		data.email = data.userIdOrEmail;
	} else {
		data.userId = data.userIdOrEmail;
	}

	delete data.userIdOrEmail;

	return data;

};