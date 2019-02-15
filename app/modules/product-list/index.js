module.exports = Thunder => {

	const implementation = {
		name: 'product-list'
	};

	implementation.options = () => ({
		page:        1,            // Which page of products?
		limit:       24,           // How many products at once?
		sort:        '-createdAt', // Default sort order
		fields:      '',           // Additional fields
		columns:     4,            // How many columns? (css supports for 1-12)
		filter:      '',           // Extra filters. e.g., brand=abcd
		imageWidth:  240,          // Image width
		imageHeight: 240,          // Image height
		showSummary: true,         // Show `product.summary`
		showRating:  (             // Show `product.rating`
			Thunder.options.productReview &&
			Thunder.options.productReviewRating
		),
		showComparePrice: true,  // Show `product.price.original`
		usePagination:    true,  // Use pagination?

		onViewProduct: function($container, context, productId) {
			return Thunder.open('product-detail', {
				product: productId
			});
		}
	});

	implementation.pre = function(context, callback) {

		const options = context.options;

		const query = $.extend({
			bundled: false // Only display root products
		}, Thunder.util.parseQueryString(options.filter));

		const listQuery = $.extend({
			fields: [
				'thumbnail',
				'slug',
				'name',
				'summary',
				'price',
				'discount',
				'rating',
			]
			.concat(Thunder.util.parseArrayString(options.fields))
			.join(','),
			page:   options.page,   // Page option
			limit:  options.limit,  // Limit option
			sort:   options.sort,   // Sort option
		}, query);

		const countQuery = $.extend({
			raw: true,
		}, query);

		const errors = {
			default: context.m('productListFailed')
		};

		return $.when(...[
			Thunder.request({
				method: 'GET',
				url:    '/v1/products',
				query:  listQuery,
			}),
			context.options.usePagination ? Thunder.request({
				method: 'GET',
				url:    '/v1/products/count',
				query:  countQuery,
			}) : null
		]).then((products, count) => {

			context.products = products[0];
			context.count = count ? count[0].count : null;

			return callback(null, context);

		}, err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $product = $(this).find('.thunder--product');
		const $pagination = $(this).find('.thunder--product-list-pagination');

		$product.on('click', [
			'.thunder--product-thumbnail-wrapper',
			'.thunder--product-name',
			'.thunder--product-summary',
		].join(','), event => Thunder.execute(
			context.options.onViewProduct,
			$container,
			context,
			$(event.delegateTarget).data('product')
		));

		if (context.options.usePagination) {

			Thunder.plugins.pagination({
				container:     $pagination,
				currentPage:   context.options.page,
				totalResult:   context.count,
				resultPerPage: context.options.limit,
				onPageChange:  ({ page }) => Thunder.render(
					$container,
					implementation.name,
					$.extend(context.options, { page })
				)
			});
		}

	};

	return implementation;

};