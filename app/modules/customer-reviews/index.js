module.exports = Thunder => {

	const implementation = {
		name: 'customer-reviews'
	};

	implementation.options = () => ({
		page:            1,                                    // Which page of reviews?
		limit:           12,                                   // How many reviews at once?
		sort:            '-createdAt',                         // Default sort value
		useRating:       Thunder.options.productReviewRating,  // Use rating?
		useComments:     Thunder.options.productReviewComment, // Use review comments?
		useHelpVote:     true,                                 // Use helpful votes?
		usePagination:   true,                                 // Use Pagination?

		onViewReview: function($container, context, reviewId) {

			return Thunder.render($container, 'customer-review', {
				review:        reviewId,
				useRating:     context.options.useRating,
				useHelpVote:   context.options.useHelpVote,
				useComments:   context.options.useComments,
				back:          {
					$container: $container,
					component:  implementation.name,
					options:    context.options
				}
			});

		}
	});

	implementation.pre = function(context, callback) {

		const customer = Thunder.authenticated('customer').sub;

		const errors = {
			default: context.m('reviewListFailed')
		};

		return $.when(
			fetchReviews(),
			countReviews()
		).then((reviews, count) => callback(null, $.extend(context, {
			reviews: reviews[0] || [],
			count:   count ? count[0].count : null,
		})), err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));

		function fetchReviews() {

			return Thunder.request({
				method: 'GET',
				url: '/v1/products/reviews/published',
				query: {
					customer: customer,
					page:     context.options.page,
					limit:    context.options.limit,
					sort:     context.options.sort,
					fields:   [
						'product',
						'title',
						'images',
						'rating',
						'helped',
						'totalComment',
						'createdAt',
					].join(','),
					embed: '+product.thumbnail'
				}
			});

		}

		function countReviews() {

			return Thunder.request({
				method: 'GET',
				url: '/v1/products/reviews/published/count',
				query: {
					customer: customer,
				}
			});

		}

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $viewReview = $(this).find('.thunder--view-review');
		const $pagination = $(this).find('.thunder--customer-review-list-pagination');

		$viewReview.on('click', function(event) {

			event.preventDefault();

			const reviewId = $(this).parents('[data-review]').data('review');

			return Thunder.execute(
				context.options.onViewReview,
				$container,
				context,
				reviewId
			);

		});

		if (context.options.usePagination) {

			Thunder.plugins.pagination({
				container:     $pagination,
				currentPage:   context.options.page,
				totalResult:   context.count.raw,
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