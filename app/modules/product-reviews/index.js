module.exports = Thunder => {

	const implementation = {
		name: 'product-reviews'
	};

	implementation.options = () => ({
		product:           null,                                 // Product ID
		page:              1,                                    // Which page of products?
		limit:             10,                                   // How many products at once?
		sort:              '-createdAt',                         // Default sort value
		productRating:     null,                                 // Product rating?
		useCustomerAvatar: Thunder.options.customerAvatar,       // Use customer avatar?
		useBodyExcerpt:    140,                                  // Body excerpt length || false
		useRating:         (                                     // Use rating?
			Thunder.options.productReview &&
			Thunder.options.productReviewRating
		),
		useHelpVote:       true,                                 // Use helpful votes?
		useFlag:           true,                                 // Use flag?
		useComments:       Thunder.options.productReviewComment, // Use comments?
		usePagination:     true,                                 // Use Pagination?

		onUnauthenticatedWriteReview: function($container, context) {
			return Thunder.notify('info', context.m('loginRequired'));
		}
	});

	implementation.pre = function(context, callback) {

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
					product: context.options.product,
					page:    context.options.page,
					limit:   context.options.limit,
					sort:    context.options.sort,
					fields:  [
						'customer',
						'title',
						'body',
						'images',
						'rating',
						'helped',
						'flagged',
						'totalComment',
						'createdAt',
					].join(',')
				}
			});

		}

		function countReviews() {

			return Thunder.request({
				method: 'GET',
				url: '/v1/products/reviews/published/count',
				query: {
					product: context.options.product,
				}
			});

		}

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $writeReview = $(this).find('.thunder--write-review');
		const $reviewList = $(this).find('.thunder--product-review-list');
		const $pagination = $(this).find('.thunder--product-review-list-pagination');
		const $reviewWriterContainer = $(this).find('.thunder--review-writer-container');

		$writeReview.on('click', startReviewWriting);

		Thunder.render($reviewWriterContainer, 'product-review-writer', {
			product:         context.options.product,
			useRating:       context.options.useRating,
			onReviewPost:    onReviewPost,
			onReviewCancel:  () => hideReviewWriter(),
		});

		context.reviews.forEach(review => renderReview('append', review));

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

		function renderReview(command, review) {

			const $reviewContainer = $(`<div class="thunder--product-review-wrapper" data-review="${review._id}"></div>`);

			$reviewList[command]($reviewContainer);

			return Thunder.render($reviewContainer, 'product-review', {
				review:            review,
				useCustomerAvatar: context.options.useCustomerAvatar,
				useBodyExcerpt:    context.options.useBodyExcerpt,
				useRating:         context.options.useRating,
				useHelpVote:       context.options.useHelpVote,
				useFlag:           context.options.useFlag,
				useComments:       context.options.useComments,
				showProduct:       false,
				showComments:      false,
			});

		}

		function startReviewWriting(event) {

			event.preventDefault();

			if (Thunder.authenticated()) {
				return showReviewWriter();
			}

			return Thunder.execute(
				context.options.onUnauthenticatedWriteReview,
				$container,
				context
			);

		}

		function onReviewPost(_$container, _context, review) {

			context.reviews.unshift(review);

			hideReviewWriter();
			renderReview('prepend', review);
		}

		function showReviewWriter() {
			$writeReview.hide();
			$reviewWriterContainer.show();
		}

		function hideReviewWriter() {
			$writeReview.show();
			$reviewWriterContainer.hide();
		}

	};

	return implementation;

};