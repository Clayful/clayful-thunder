const set = require('lodash.set');

module.exports = Thunder => {

	// Implementation
	const implementation = {
		name: 'catalog-slider'
	};

	implementation.options = () => ({
		useNav:      true,
		usePager:    true,
		showCaption: true,
		autoLoop:    3000
	});

	implementation.pre = function(context, callback) {

		const errors = {};
		const catalogId = context.options.catalog;

		context.targetCheck = url => {

			const urlTarget = document.createElement('a');

			urlTarget.href = url;

			return urlTarget.host === window.location.host ? '_self' : '_blank';
		};

		return Thunder.request({
			method: 'GET',
			url:    `/v1/catalogs/${catalogId}`,
			query:  {
				fields: [
					'slug',
					'items.image',
					'items.link',
					'items.title',
				].join(',')
			}
		}).then(data => {

			return callback(null, set(context, 'catalogSlider', data));

		}, err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));

	};

	implementation.init = function(context) {

		const options = {
			item:           1,
			speed:          800,
			slideMargin:    0,
			gallery:        false,
			pauseOnHover:   true,
			loop:           true,
			adaptiveHeight: true,
			pager:          context.options.usePager,
			controls:       context.options.useNav,
			auto:           !!context.options.autoLoop,
			pause:          context.options.autoLoop || 3000,
			prevHtml:       `<img src="${Thunder.uis['left-arrow']()}">`,
			nextHtml:       `<img src="${Thunder.uis['right-arrow']()}">`
		};

		const slider = $(this).find('.thunder--catlaog-slider').lightSlider(options);

		return {
			// Expose slider methods
			goToSlide:     slider.goToSlide,
			goToPrevSlide: slider.goToPrevSlide,
			goToNextSlide: slider.goToNextSlide,
			play:          slider.play,
			pause:         slider.pause,
			// Expose custom destory method
			destroy:       () => {
				slider.pause();   // To clear interval
				slider.destroy(); // Destroy the slider
				slider.remove();  // Remove the DOM
			},
		};

	};

	return implementation;

};