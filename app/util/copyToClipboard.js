module.exports = function copyToClipboard(elem) {
		// create hidden text element, if it doesn't already exist
		const targetId = "_hiddenCopyText_";
		const isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
		let origSelectionStart;
		let origSelectionEnd;
		let target;

		if (isInput) {
				// can just use the original source element for the selection and copy
				target = elem;
				origSelectionStart = elem.selectionStart;
				origSelectionEnd = elem.selectionEnd;
		} else {
				// must use a temporary form element for the selection and copy
				target = document.getElementById(targetId);
				if (!target) {
						target = document.createElement("textarea");
						target.style.position = "absolute";
						target.style.left = "-9999px";
						target.style.top = "0";
						target.id = targetId;
						document.body.appendChild(target);
				}
				target.textContent = elem.text();
		}
		// select the content
		let currentFocus = document.activeElement;

		target.focus();
		target.setSelectionRange(0, target.value.length);

		// copy the selection
		let succeed;

		try {
				succeed = document.execCommand("copy");
				Thunder.notify('success', Thunder.polyglot.phrases['copyText.copySuccess']);
		} catch (e) {
				succeed = false;
				Thunder.notify('success', Thunder.polyglot.phrases['copyText.copyFailed']);
		}
		// restore original focus
		if (currentFocus && typeof currentFocus.focus === "function") {
				currentFocus.focus();
		}

		if (isInput) {
				// restore prior selection
				elem.setSelectionRange(origSelectionStart, origSelectionEnd);
		} else {
				// clear temporary content
				target.textContent = "";
		}
		return succeed;
};