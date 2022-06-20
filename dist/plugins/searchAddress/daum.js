(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

/**
 * Based on Daum's postcode search API.
 * - Daum's Postcode JS SDK should be imported before this plugin.
 * - Guide: http://postcode.map.daum.net/guide
 */

var implementation = function implementation() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


	options = $.extend({
		type: 'popup',
		options: {}
	}, options);

	return function (callback) {

		var onFinish = [];

		var windowWidth = $(window).width();
		var windowHeight = $(window).height();

		var width = 500;
		var height = 500;

		if (windowWidth > 500) {
			width = 500;
		} else if (windowWidth * 0.9 < 300) {
			width = 300;
		} else {
			width = parseInt(windowWidth * 0.9);
		}

		if (windowHeight > 500) {
			height = 500;
		} else if (windowHeight * 0.9 < 400) {
			height = 400;
		} else {
			height = parseInt(windowHeight * 0.9);
		}

		var widget = new daum.Postcode($.extend(options.options, {
			oncomplete: function oncomplete(data) {

				onFinish.forEach(function (fn) {
					return fn();
				});

				return callback(null, {
					postcode: data.zonecode || data.postcode,
					country: 'KR', // Since Daum API only supports for Korean addresses, default value is always 'KR'
					state: data.sido,
					city: data.sigungu.split(' ')[0] || data.sido,
					address1: data.address,
					address2: ''
				});
			}
		}, options.type === 'overlay' ? {
			width: width,
			height: height
		} : {}));

		if (options.type === 'popup') {
			widget.open();
		}
		if (options.type === 'overlay') {

			var container = $('<div class="thunder--daum-search-address">\n\t\t\t\t<span class="thunder--daum-search-address-close">\xD7</span>\n\t\t\t\t<div class="thunder--daum-search-address-wrap"></div>\n\t\t\t</div>');
			var close = container.find('.thunder--daum-search-address-close');
			var wrap = container.find('.thunder--daum-search-address-wrap');
			var posTop = (windowHeight - (height + 36)) / 2;
			var posLeft = (windowWidth - width) / 2;
			var shadow = '#000 0 10px 26px -28px';

			container.css({
				position: 'fixed',
				'z-index': 99999,
				top: posTop,
				left: posLeft,
				'text-align': 'right',
				'background-color': '#333',
				border: '#dadada 1px solid',
				'border-radius': '4px',
				color: '#FFF',
				'-webkit-box-shadow': shadow,
				'-moz-box-shadow': shadow,
				'box-shadow': shadow
			});
			close.css({
				display: 'inline-block',
				'font-size': '22px',
				'padding-bottom': '7px',
				'margin-right': '8px',
				cursor: 'pointer'
			});

			container.on('click', '.thunder--daum-search-address-close', function () {
				return container.remove();
			});

			container.hide();

			$('body').append(container);

			widget.embed(wrap[0]);

			container.show();

			onFinish.push(function () {
				return container.remove();
			});
		}
	};
};

window.ThunderSearchAddressDaum = implementation;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwbHVnaW5zL3NlYXJjaEFkZHJlc3MvZGF1bS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7OztBQU1BLElBQU0saUJBQWlCLFNBQWpCLGNBQWlCLEdBQWtCO0FBQUEsS0FBakIsT0FBaUIsdUVBQVAsRUFBTzs7O0FBRXhDLFdBQVUsRUFBRSxNQUFGLENBQVM7QUFDbEIsUUFBUyxPQURTO0FBRWxCLFdBQVM7QUFGUyxFQUFULEVBR1AsT0FITyxDQUFWOztBQUtBLFFBQU8sb0JBQVk7O0FBRWxCLE1BQU0sV0FBVyxFQUFqQjs7QUFFQSxNQUFNLGNBQWMsRUFBRSxNQUFGLEVBQVUsS0FBVixFQUFwQjtBQUNBLE1BQU0sZUFBZSxFQUFFLE1BQUYsRUFBVSxNQUFWLEVBQXJCOztBQUVBLE1BQUksUUFBUSxHQUFaO0FBQ0EsTUFBSSxTQUFTLEdBQWI7O0FBRUEsTUFBSSxjQUFjLEdBQWxCLEVBQXVCO0FBQ3RCLFdBQVEsR0FBUjtBQUNBLEdBRkQsTUFFTyxJQUFJLGNBQWMsR0FBZCxHQUFvQixHQUF4QixFQUE2QjtBQUNuQyxXQUFRLEdBQVI7QUFDQSxHQUZNLE1BRUE7QUFDTixXQUFRLFNBQVMsY0FBYyxHQUF2QixDQUFSO0FBQ0E7O0FBRUQsTUFBSSxlQUFlLEdBQW5CLEVBQXdCO0FBQ3ZCLFlBQVMsR0FBVDtBQUNBLEdBRkQsTUFFTyxJQUFJLGVBQWUsR0FBZixHQUFxQixHQUF6QixFQUE4QjtBQUNwQyxZQUFTLEdBQVQ7QUFDQSxHQUZNLE1BRUE7QUFDTixZQUFTLFNBQVMsZUFBZSxHQUF4QixDQUFUO0FBQ0E7O0FBRUQsTUFBTSxTQUFTLElBQUksS0FBSyxRQUFULENBQWtCLEVBQUUsTUFBRixDQUNoQyxRQUFRLE9BRHdCLEVBRWhDO0FBQ0MsZUFBWSwwQkFBUTs7QUFFbkIsYUFBUyxPQUFULENBQWlCO0FBQUEsWUFBTSxJQUFOO0FBQUEsS0FBakI7O0FBRUEsV0FBTyxTQUFTLElBQVQsRUFBZTtBQUNyQixlQUFVLEtBQUssUUFBTCxJQUFpQixLQUFLLFFBRFg7QUFFckIsY0FBVSxJQUZXLEVBRUw7QUFDaEIsWUFBVSxLQUFLLElBSE07QUFJckIsV0FBVSxLQUFLLE9BQUwsQ0FBYSxLQUFiLENBQW1CLEdBQW5CLEVBQXdCLENBQXhCLEtBQThCLEtBQUssSUFKeEI7QUFLckIsZUFBVSxLQUFLLE9BTE07QUFNckIsZUFBVTtBQU5XLEtBQWYsQ0FBUDtBQVFBO0FBYkYsR0FGZ0MsRUFpQmhDLFFBQVEsSUFBUixLQUFpQixTQUFqQixHQUE2QjtBQUM1QixVQUFRLEtBRG9CO0FBRTVCLFdBQVE7QUFGb0IsR0FBN0IsR0FHSSxFQXBCNEIsQ0FBbEIsQ0FBZjs7QUF1QkEsTUFBSSxRQUFRLElBQVIsS0FBaUIsT0FBckIsRUFBOEI7QUFDN0IsVUFBTyxJQUFQO0FBQ0E7QUFDRCxNQUFJLFFBQVEsSUFBUixLQUFpQixTQUFyQixFQUFnQzs7QUFFL0IsT0FBTSxZQUFZLGtNQUFsQjtBQUlBLE9BQU0sUUFBUSxVQUFVLElBQVYsQ0FBZSxxQ0FBZixDQUFkO0FBQ0EsT0FBTSxPQUFPLFVBQVUsSUFBVixDQUFlLG9DQUFmLENBQWI7QUFDQSxPQUFNLFNBQVMsQ0FBQyxnQkFBZ0IsU0FBUyxFQUF6QixDQUFELElBQWlDLENBQWhEO0FBQ0EsT0FBTSxVQUFVLENBQUMsY0FBYyxLQUFmLElBQXdCLENBQXhDO0FBQ0EsT0FBTSxTQUFTLHdCQUFmOztBQUVBLGFBQVUsR0FBVixDQUFjO0FBQ2IsY0FBc0IsT0FEVDtBQUViLGVBQXNCLEtBRlQ7QUFHYixTQUFzQixNQUhUO0FBSWIsVUFBc0IsT0FKVDtBQUtiLGtCQUFzQixPQUxUO0FBTWIsd0JBQXNCLE1BTlQ7QUFPYixZQUFzQixtQkFQVDtBQVFiLHFCQUFzQixLQVJUO0FBU2IsV0FBc0IsTUFUVDtBQVViLDBCQUFzQixNQVZUO0FBV2IsdUJBQXNCLE1BWFQ7QUFZYixrQkFBc0I7QUFaVCxJQUFkO0FBY0EsU0FBTSxHQUFOLENBQVU7QUFDVCxhQUFrQixjQURUO0FBRVQsaUJBQWtCLE1BRlQ7QUFHVCxzQkFBa0IsS0FIVDtBQUlULG9CQUFrQixLQUpUO0FBS1QsWUFBa0I7QUFMVCxJQUFWOztBQVFBLGFBQVUsRUFBVixDQUFhLE9BQWIsRUFBc0IscUNBQXRCLEVBQTZELFlBQU07QUFDbEUsV0FBTyxVQUFVLE1BQVYsRUFBUDtBQUNBLElBRkQ7O0FBSUEsYUFBVSxJQUFWOztBQUVBLEtBQUUsTUFBRixFQUFVLE1BQVYsQ0FBaUIsU0FBakI7O0FBRUEsVUFBTyxLQUFQLENBQWEsS0FBSyxDQUFMLENBQWI7O0FBRUEsYUFBVSxJQUFWOztBQUVBLFlBQVMsSUFBVCxDQUFjO0FBQUEsV0FBTSxVQUFVLE1BQVYsRUFBTjtBQUFBLElBQWQ7QUFDQTtBQUVELEVBckdEO0FBdUdBLENBOUdEOztBQWdIQSxPQUFPLHdCQUFQLEdBQWtDLGNBQWxDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBCYXNlZCBvbiBEYXVtJ3MgcG9zdGNvZGUgc2VhcmNoIEFQSS5cbiAqIC0gRGF1bSdzIFBvc3Rjb2RlIEpTIFNESyBzaG91bGQgYmUgaW1wb3J0ZWQgYmVmb3JlIHRoaXMgcGx1Z2luLlxuICogLSBHdWlkZTogaHR0cDovL3Bvc3Rjb2RlLm1hcC5kYXVtLm5ldC9ndWlkZVxuICovXG5cbmNvbnN0IGltcGxlbWVudGF0aW9uID0gKG9wdGlvbnMgPSB7fSkgPT4ge1xuXG5cdG9wdGlvbnMgPSAkLmV4dGVuZCh7XG5cdFx0dHlwZTogICAgJ3BvcHVwJyxcblx0XHRvcHRpb25zOiB7fVxuXHR9LCBvcHRpb25zKTtcblxuXHRyZXR1cm4gY2FsbGJhY2sgPT4ge1xuXG5cdFx0Y29uc3Qgb25GaW5pc2ggPSBbXTtcblxuXHRcdGNvbnN0IHdpbmRvd1dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG5cdFx0Y29uc3Qgd2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXG5cdFx0bGV0IHdpZHRoID0gNTAwO1xuXHRcdGxldCBoZWlnaHQgPSA1MDA7XG5cblx0XHRpZiAod2luZG93V2lkdGggPiA1MDApIHtcblx0XHRcdHdpZHRoID0gNTAwO1xuXHRcdH0gZWxzZSBpZiAod2luZG93V2lkdGggKiAwLjkgPCAzMDApIHtcblx0XHRcdHdpZHRoID0gMzAwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aWR0aCA9IHBhcnNlSW50KHdpbmRvd1dpZHRoICogMC45KTtcblx0XHR9XG5cblx0XHRpZiAod2luZG93SGVpZ2h0ID4gNTAwKSB7XG5cdFx0XHRoZWlnaHQgPSA1MDA7XG5cdFx0fSBlbHNlIGlmICh3aW5kb3dIZWlnaHQgKiAwLjkgPCA0MDApIHtcblx0XHRcdGhlaWdodCA9IDQwMDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aGVpZ2h0ID0gcGFyc2VJbnQod2luZG93SGVpZ2h0ICogMC45KTtcblx0XHR9XG5cblx0XHRjb25zdCB3aWRnZXQgPSBuZXcgZGF1bS5Qb3N0Y29kZSgkLmV4dGVuZChcblx0XHRcdG9wdGlvbnMub3B0aW9ucyxcblx0XHRcdHtcblx0XHRcdFx0b25jb21wbGV0ZTogZGF0YSA9PiB7XG5cblx0XHRcdFx0XHRvbkZpbmlzaC5mb3JFYWNoKGZuID0+IGZuKCkpO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKG51bGwsIHtcblx0XHRcdFx0XHRcdHBvc3Rjb2RlOiBkYXRhLnpvbmVjb2RlIHx8IGRhdGEucG9zdGNvZGUsXG5cdFx0XHRcdFx0XHRjb3VudHJ5OiAgJ0tSJywgLy8gU2luY2UgRGF1bSBBUEkgb25seSBzdXBwb3J0cyBmb3IgS29yZWFuIGFkZHJlc3NlcywgZGVmYXVsdCB2YWx1ZSBpcyBhbHdheXMgJ0tSJ1xuXHRcdFx0XHRcdFx0c3RhdGU6ICAgIGRhdGEuc2lkbyxcblx0XHRcdFx0XHRcdGNpdHk6ICAgICBkYXRhLnNpZ3VuZ3Uuc3BsaXQoJyAnKVswXSB8fCBkYXRhLnNpZG8sXG5cdFx0XHRcdFx0XHRhZGRyZXNzMTogZGF0YS5hZGRyZXNzLFxuXHRcdFx0XHRcdFx0YWRkcmVzczI6ICcnLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0b3B0aW9ucy50eXBlID09PSAnb3ZlcmxheScgPyB7XG5cdFx0XHRcdHdpZHRoOiAgd2lkdGgsXG5cdFx0XHRcdGhlaWdodDogaGVpZ2h0XG5cdFx0XHR9IDoge31cblx0XHQpKTtcblxuXHRcdGlmIChvcHRpb25zLnR5cGUgPT09ICdwb3B1cCcpIHtcblx0XHRcdHdpZGdldC5vcGVuKCk7XG5cdFx0fVxuXHRcdGlmIChvcHRpb25zLnR5cGUgPT09ICdvdmVybGF5Jykge1xuXG5cdFx0XHRjb25zdCBjb250YWluZXIgPSAkKGA8ZGl2IGNsYXNzPVwidGh1bmRlci0tZGF1bS1zZWFyY2gtYWRkcmVzc1wiPlxuXHRcdFx0XHQ8c3BhbiBjbGFzcz1cInRodW5kZXItLWRhdW0tc2VhcmNoLWFkZHJlc3MtY2xvc2VcIj7Dlzwvc3Bhbj5cblx0XHRcdFx0PGRpdiBjbGFzcz1cInRodW5kZXItLWRhdW0tc2VhcmNoLWFkZHJlc3Mtd3JhcFwiPjwvZGl2PlxuXHRcdFx0PC9kaXY+YCk7XG5cdFx0XHRjb25zdCBjbG9zZSA9IGNvbnRhaW5lci5maW5kKCcudGh1bmRlci0tZGF1bS1zZWFyY2gtYWRkcmVzcy1jbG9zZScpO1xuXHRcdFx0Y29uc3Qgd3JhcCA9IGNvbnRhaW5lci5maW5kKCcudGh1bmRlci0tZGF1bS1zZWFyY2gtYWRkcmVzcy13cmFwJyk7XG5cdFx0XHRjb25zdCBwb3NUb3AgPSAod2luZG93SGVpZ2h0IC0gKGhlaWdodCArIDM2KSkgLyAyO1xuXHRcdFx0Y29uc3QgcG9zTGVmdCA9ICh3aW5kb3dXaWR0aCAtIHdpZHRoKSAvIDI7XG5cdFx0XHRjb25zdCBzaGFkb3cgPSAnIzAwMCAwIDEwcHggMjZweCAtMjhweCc7XG5cblx0XHRcdGNvbnRhaW5lci5jc3Moe1xuXHRcdFx0XHRwb3NpdGlvbjogICAgICAgICAgICAgJ2ZpeGVkJyxcblx0XHRcdFx0J3otaW5kZXgnOiAgICAgICAgICAgIDk5OTk5LFxuXHRcdFx0XHR0b3A6ICAgICAgICAgICAgICAgICAgcG9zVG9wLFxuXHRcdFx0XHRsZWZ0OiAgICAgICAgICAgICAgICAgcG9zTGVmdCxcblx0XHRcdFx0J3RleHQtYWxpZ24nOiAgICAgICAgICdyaWdodCcsXG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yJzogICAnIzMzMycsXG5cdFx0XHRcdGJvcmRlcjogICAgICAgICAgICAgICAnI2RhZGFkYSAxcHggc29saWQnLFxuXHRcdFx0XHQnYm9yZGVyLXJhZGl1cyc6ICAgICAgJzRweCcsXG5cdFx0XHRcdGNvbG9yOiAgICAgICAgICAgICAgICAnI0ZGRicsXG5cdFx0XHRcdCctd2Via2l0LWJveC1zaGFkb3cnOiBzaGFkb3csXG5cdFx0XHRcdCctbW96LWJveC1zaGFkb3cnOiAgICBzaGFkb3csXG5cdFx0XHRcdCdib3gtc2hhZG93JzogICAgICAgICBzaGFkb3csXG5cdFx0XHR9KTtcblx0XHRcdGNsb3NlLmNzcyh7XG5cdFx0XHRcdGRpc3BsYXk6ICAgICAgICAgICdpbmxpbmUtYmxvY2snLFxuXHRcdFx0XHQnZm9udC1zaXplJzogICAgICAnMjJweCcsXG5cdFx0XHRcdCdwYWRkaW5nLWJvdHRvbSc6ICc3cHgnLFxuXHRcdFx0XHQnbWFyZ2luLXJpZ2h0JzogICAnOHB4Jyxcblx0XHRcdFx0Y3Vyc29yOiAgICAgICAgICAgJ3BvaW50ZXInLFxuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnRhaW5lci5vbignY2xpY2snLCAnLnRodW5kZXItLWRhdW0tc2VhcmNoLWFkZHJlc3MtY2xvc2UnLCAoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBjb250YWluZXIucmVtb3ZlKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Y29udGFpbmVyLmhpZGUoKTtcblxuXHRcdFx0JCgnYm9keScpLmFwcGVuZChjb250YWluZXIpO1xuXG5cdFx0XHR3aWRnZXQuZW1iZWQod3JhcFswXSk7XG5cblx0XHRcdGNvbnRhaW5lci5zaG93KCk7XG5cblx0XHRcdG9uRmluaXNoLnB1c2goKCkgPT4gY29udGFpbmVyLnJlbW92ZSgpKTtcblx0XHR9XG5cblx0fTtcblxufTtcblxud2luZG93LlRodW5kZXJTZWFyY2hBZGRyZXNzRGF1bSA9IGltcGxlbWVudGF0aW9uOyJdfQ==
