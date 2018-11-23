// David Walsh's debounce function snippets (slightly modified)
// Ref: https://davidwalsh.name/javascript-debounce-function
module.exports = function(func, wait, immediate) {

	let timeout;

	return function() {

		let context = this;
		let args = arguments;
		let callNow = immediate && !timeout;
		let later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};

};