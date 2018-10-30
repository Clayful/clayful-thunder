const emojiByType = {
	error:   '🚨',
	success: '✅',
	info:    '💬',
};

module.exports = function(type, message) {

	return alert(`${emojiByType[type] || ''} ${message}`);

};