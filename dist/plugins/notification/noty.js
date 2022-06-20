(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

/**
 * Based on Noty JavaScript library.
 * - Noty should be imported before this plugin.
 * - Website: https://ned.im/noty/#/
 */

var implementation = function implementation() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var _options$emojiByType = options.emojiByType,
	    emojiByType = _options$emojiByType === undefined ? {
		error: '🚨',
		success: '✅',
		info: '💬'
	} : _options$emojiByType,
	    _options$theme = options.theme,
	    theme = _options$theme === undefined ? 'metroui' : _options$theme,
	    _options$layout = options.layout,
	    layout = _options$layout === undefined ? 'topRight' : _options$layout,
	    _options$timeout = options.timeout,
	    timeout = _options$timeout === undefined ? 2000 : _options$timeout;


	return function (type, message) {
		return new Noty({
			theme: theme,
			type: type || 'info',
			text: ((emojiByType[type] || '') + ' ' + message).trim(),
			layout: layout,
			timeout: timeout
		}).show();
	};
};

window.ThunderNotificationNoty = implementation;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwbHVnaW5zL25vdGlmaWNhdGlvbi9ub3R5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7O0FBTUEsSUFBTSxpQkFBaUIsU0FBakIsY0FBaUIsR0FBa0I7QUFBQSxLQUFqQixPQUFpQix1RUFBUCxFQUFPO0FBQUEsNEJBV3BDLE9BWG9DLENBR3ZDLFdBSHVDO0FBQUEsS0FHdkMsV0FIdUMsd0NBR3pCO0FBQ2IsU0FBUyxJQURJO0FBRWIsV0FBUyxHQUZJO0FBR2IsUUFBUztBQUhJLEVBSHlCO0FBQUEsc0JBV3BDLE9BWG9DLENBUXZDLEtBUnVDO0FBQUEsS0FRdkMsS0FSdUMsa0NBUS9CLFNBUitCO0FBQUEsdUJBV3BDLE9BWG9DLENBU3ZDLE1BVHVDO0FBQUEsS0FTdkMsTUFUdUMsbUNBUzlCLFVBVDhCO0FBQUEsd0JBV3BDLE9BWG9DLENBVXZDLE9BVnVDO0FBQUEsS0FVdkMsT0FWdUMsb0NBVTdCLElBVjZCOzs7QUFheEMsUUFBTyxVQUFDLElBQUQsRUFBTyxPQUFQO0FBQUEsU0FBbUIsSUFBSSxJQUFKLENBQVM7QUFDbEMsVUFBUyxLQUR5QjtBQUVsQyxTQUFTLFFBQVEsTUFGaUI7QUFHbEMsU0FBUyxFQUFHLFlBQVksSUFBWixLQUFxQixFQUF4QixVQUE4QixPQUE5QixFQUF3QyxJQUF4QyxFQUh5QjtBQUlsQyxXQUFTLE1BSnlCO0FBS2xDLFlBQVM7QUFMeUIsR0FBVCxFQU12QixJQU51QixFQUFuQjtBQUFBLEVBQVA7QUFRQSxDQXJCRDs7QUF1QkEsT0FBTyx1QkFBUCxHQUFpQyxjQUFqQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogQmFzZWQgb24gTm90eSBKYXZhU2NyaXB0IGxpYnJhcnkuXG4gKiAtIE5vdHkgc2hvdWxkIGJlIGltcG9ydGVkIGJlZm9yZSB0aGlzIHBsdWdpbi5cbiAqIC0gV2Vic2l0ZTogaHR0cHM6Ly9uZWQuaW0vbm90eS8jL1xuICovXG5cbmNvbnN0IGltcGxlbWVudGF0aW9uID0gKG9wdGlvbnMgPSB7fSkgPT4ge1xuXG5cdGNvbnN0IHtcblx0XHRlbW9qaUJ5VHlwZSA9IHtcblx0XHRcdGVycm9yOiAgICfwn5qoJyxcblx0XHRcdHN1Y2Nlc3M6ICfinIUnLFxuXHRcdFx0aW5mbzogICAgJ/CfkqwnLFxuXHRcdH0sXG5cdFx0dGhlbWUgPSAnbWV0cm91aScsXG5cdFx0bGF5b3V0ID0gJ3RvcFJpZ2h0Jyxcblx0XHR0aW1lb3V0ID0gMjAwMFxuXHR9ID0gb3B0aW9ucztcblxuXHRyZXR1cm4gKHR5cGUsIG1lc3NhZ2UpID0+IG5ldyBOb3R5KHtcblx0XHR0aGVtZTogICB0aGVtZSxcblx0XHR0eXBlOiAgICB0eXBlIHx8ICdpbmZvJyxcblx0XHR0ZXh0OiAgICBgJHtlbW9qaUJ5VHlwZVt0eXBlXSB8fCAnJ30gJHttZXNzYWdlfWAudHJpbSgpLFxuXHRcdGxheW91dDogIGxheW91dCxcblx0XHR0aW1lb3V0OiB0aW1lb3V0XG5cdH0pLnNob3coKTtcblxufTtcblxud2luZG93LlRodW5kZXJOb3RpZmljYXRpb25Ob3R5ID0gaW1wbGVtZW50YXRpb247Il19
