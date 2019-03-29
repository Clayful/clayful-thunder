/**
 * Based on Daum's postcode search API.
 * - Daum's Postcode JS SDK should be imported before this plugin.
 * - Guide: http://postcode.map.daum.net/guide
 */

const implementation = (options = {}) => {

	options = $.extend({
		type:    'popup',
		options: {}
	}, options);

	return callback => {

		const onFinish = [];

		const windowWidth = $(window).width();
		const windowHeight = $(window).height();

		let width = 500;
		let height = 500;

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

		const widget = new daum.Postcode($.extend(
			options.options,
			{
				oncomplete: data => {

					onFinish.forEach(fn => fn());

					return callback(null, {
						postcode: data.zonecode || data.postcode,
						country:  'KR', // Since Daum API only supports for Korean addresses, default value is always 'KR'
						state:    data.sido,
						city:     data.sigungu.split(' ')[0] || data.sido,
						address1: data.address,
						address2: '',
					});
				}
			},
			options.type === 'overlay' ? {
				width:  width,
				height: height
			} : {}
		));

		if (options.type === 'popup') {
			widget.open();
		}
		if (options.type === 'overlay') {

			const container = $(`<div class="thunder--daum-search-address">
				<span class="thunder--daum-search-address-close">×</span>
				<div class="thunder--daum-search-address-wrap"></div>
			</div>`);
			const close = container.find('.thunder--daum-search-address-close');
			const wrap = container.find('.thunder--daum-search-address-wrap');
			const posTop = (windowHeight - (height + 36)) / 2;
			const posLeft = (windowWidth - width) / 2;
			const shadow = '#000 0 10px 26px -28px';

			container.css({
				position:             'fixed',
				'z-index':            99999,
				top:                  posTop,
				left:                 posLeft,
				'text-align':         'right',
				'background-color':   '#333',
				border:               '#dadada 1px solid',
				'border-radius':      '4px',
				color:                '#FFF',
				'-webkit-box-shadow': shadow,
				'-moz-box-shadow':    shadow,
				'box-shadow':         shadow,
			});
			close.css({
				display:          'inline-block',
				'font-size':      '22px',
				'padding-bottom': '7px',
				'margin-right':   '8px',
				cursor:           'pointer',
			});

			container.on('click', '.thunder--daum-search-address-close', () => {
				return container.remove();
			});

			container.hide();

			$('body').append(container);

			widget.embed(wrap[0]);

			container.show();

			onFinish.push(() => container.remove());
		}

	};

};

window.ThunderSearchAddressDaum = implementation;