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

module.exports = window.ThunderNotificationNoty = implementation;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwbHVnaW5zL25vdGlmaWNhdGlvbi9ub3R5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7O0FBTUEsSUFBTSxpQkFBaUIsU0FBakIsY0FBaUIsR0FBa0I7QUFBQSxLQUFqQixPQUFpQix1RUFBUCxFQUFPO0FBQUEsNEJBV3BDLE9BWG9DLENBR3ZDLFdBSHVDO0FBQUEsS0FHdkMsV0FIdUMsd0NBR3pCO0FBQ2IsU0FBUyxJQURJO0FBRWIsV0FBUyxHQUZJO0FBR2IsUUFBUztBQUhJLEVBSHlCO0FBQUEsc0JBV3BDLE9BWG9DLENBUXZDLEtBUnVDO0FBQUEsS0FRdkMsS0FSdUMsa0NBUS9CLFNBUitCO0FBQUEsdUJBV3BDLE9BWG9DLENBU3ZDLE1BVHVDO0FBQUEsS0FTdkMsTUFUdUMsbUNBUzlCLFVBVDhCO0FBQUEsd0JBV3BDLE9BWG9DLENBVXZDLE9BVnVDO0FBQUEsS0FVdkMsT0FWdUMsb0NBVTdCLElBVjZCOzs7QUFheEMsUUFBTyxVQUFDLElBQUQsRUFBTyxPQUFQO0FBQUEsU0FBbUIsSUFBSSxJQUFKLENBQVM7QUFDbEMsVUFBUyxLQUR5QjtBQUVsQyxTQUFTLFFBQVEsTUFGaUI7QUFHbEMsU0FBUyxFQUFHLFlBQVksSUFBWixLQUFxQixFQUF4QixVQUE4QixPQUE5QixFQUF3QyxJQUF4QyxFQUh5QjtBQUlsQyxXQUFTLE1BSnlCO0FBS2xDLFlBQVM7QUFMeUIsR0FBVCxFQU12QixJQU51QixFQUFuQjtBQUFBLEVBQVA7QUFRQSxDQXJCRDs7QUF1QkEsT0FBTyxPQUFQLEdBQWlCLE9BQU8sdUJBQVAsR0FBaUMsY0FBbEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcclxuICogQmFzZWQgb24gTm90eSBKYXZhU2NyaXB0IGxpYnJhcnkuXHJcbiAqIC0gTm90eSBzaG91bGQgYmUgaW1wb3J0ZWQgYmVmb3JlIHRoaXMgcGx1Z2luLlxyXG4gKiAtIFdlYnNpdGU6IGh0dHBzOi8vbmVkLmltL25vdHkvIy9cclxuICovXHJcblxyXG5jb25zdCBpbXBsZW1lbnRhdGlvbiA9IChvcHRpb25zID0ge30pID0+IHtcclxuXHJcblx0Y29uc3Qge1xyXG5cdFx0ZW1vamlCeVR5cGUgPSB7XHJcblx0XHRcdGVycm9yOiAgICfwn5qoJyxcclxuXHRcdFx0c3VjY2VzczogJ+KchScsXHJcblx0XHRcdGluZm86ICAgICfwn5KsJyxcclxuXHRcdH0sXHJcblx0XHR0aGVtZSA9ICdtZXRyb3VpJyxcclxuXHRcdGxheW91dCA9ICd0b3BSaWdodCcsXHJcblx0XHR0aW1lb3V0ID0gMjAwMFxyXG5cdH0gPSBvcHRpb25zO1xyXG5cclxuXHRyZXR1cm4gKHR5cGUsIG1lc3NhZ2UpID0+IG5ldyBOb3R5KHtcclxuXHRcdHRoZW1lOiAgIHRoZW1lLFxyXG5cdFx0dHlwZTogICAgdHlwZSB8fCAnaW5mbycsXHJcblx0XHR0ZXh0OiAgICBgJHtlbW9qaUJ5VHlwZVt0eXBlXSB8fCAnJ30gJHttZXNzYWdlfWAudHJpbSgpLFxyXG5cdFx0bGF5b3V0OiAgbGF5b3V0LFxyXG5cdFx0dGltZW91dDogdGltZW91dFxyXG5cdH0pLnNob3coKTtcclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5UaHVuZGVyTm90aWZpY2F0aW9uTm90eSA9IGltcGxlbWVudGF0aW9uOyJdfQ==
