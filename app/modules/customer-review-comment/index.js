const productReview = require('../product-review');

module.exports = Thunder => {

	const productReviewInstance = productReview(Thunder);

	const implementation = {
		name: 'customer-review-comment'
	};

	// Other options will be exactly same as `product-review` component
	implementation.options = () => $.extend(
		productReviewInstance.options(),
		{
			comment: null, // Comment ID
		}
	);

	implementation.pre = function(context, callback) {

		return callback(null, context);
	};

	implementation.init = function(context) {

		const $container = $(this);
		const $backToComments = $(this).find('.thunder--back-to-comments');
		const $reviewContainer = $(this).find('.thunder--customer-review-comment-container');

		Thunder.util.bindBackButton($backToComments, context);

		Thunder.render($reviewContainer, 'product-review', $.extend(
			{},
			context.options,
			{
				showProduct:  true,
				showComments: {
					filter:         { ids: context.options.comment },
					useBodyExcerpt: false,
					useFlag:        false,
					usePagination:  false,
				},
			}
		));

	};

	return implementation;

};