module.exports = function($uploadForm, successCallback, errorCallback) {

	const $file = $uploadForm.find('input[type="file"]');
	const $label = $uploadForm.find(`label[for="${$file.attr('id')}"]`);
	const originalLabel = $label.text();

	return $file.on('change', () => {

		if (!$file.val()) {
			return $label.html(originalLabel);
		}

		$label.html(this.ui('button-spinner'));

		$uploadForm.ajaxSubmit({
			method:  'POST',
			url:     `${this.options.baseURL}/v1/me/images`,
			headers: this.request.getRequestHeaders(),
			success: (...args) => {
				$label.html(originalLabel);
				return successCallback(...args);
			},
			error: (...args) => {
				$label.html(originalLabel);
				return errorCallback(...args);
			}
		});

	});

};