const productReview = require('../product-review');

module.exports = Thunder => {

	const implementation = {
		name: 'customer-review'
	};

	// All options are exactly same as `product-review` component
	implementation.options = productReview(Thunder).options;

	implementation.pre = function(context, callback) {

		return callback(null, context);
	};

	implementation.init = function(context) {

		const $container = $(this);
		const $backToReviews = $(this).find('.thunder--back-to-reviews');
		const $reviewContainer = $(this).find('.thunder--customer-review-container');

		Thunder.util.bindBackButton($backToReviews, context);

		Thunder.render($reviewContainer, 'product-review', $.extend(
			{},
			context.options,
			{
				useBodyExcerpt: false,
				useFlag:        false,
				showProduct:    true,
				showComments:   true,
			}
		));

	};

	return implementation;

};