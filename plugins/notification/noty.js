/**
 * Based on Noty JavaScript library.
 * - Noty should be imported before this plugin.
 * - Website: https://ned.im/noty/#/
 */

const implementation = (options = {}) => {

	const {
		emojiByType = {
			error:   '🚨',
			success: '✅',
			info:    '💬',
		},
		theme = 'metroui',
		layout = 'topRight',
		timeout = 2000
	} = options;

	return (type, message) => new Noty({
		theme:   theme,
		type:    type || 'info',
		text:    `${emojiByType[type] || ''} ${message}`.trim(),
		layout:  layout,
		timeout: timeout
	}).show();

};

window.ThunderNotificationNoty = implementation;