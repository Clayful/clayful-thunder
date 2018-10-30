const set = require('lodash.set');

module.exports = Thunder => {

	const implementation = {
		name: 'customer-review-comments'
	};

	implementation.options = () => ({
		page:            1,            // Which page of comments?
		limit:           10,           // How many comments at once?
		sort:            '-createdAt', // Default sort value
		usePagination:   true,         // Use Pagination?

		onViewComment: function($container, context, reviewId, commentId) {

			return Thunder.render($container, 'customer-review-comment', {
				review:  reviewId,
				comment: commentId,
				back:    {
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
			default: context.m('commentListFailed')
		};

		return $.when(
			fetchComments(),
			countComments()
		).then((comments, count) => callback(null, $.extend(context, {
			comments: comments[0] || [],
			count:    count ? count[0].count : null,
		})), err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));

		function fetchComments() {

			return Thunder.request({
				method: 'GET',
				url: '/v1/products/reviews/comments',
				query: {
					customer: customer,
					page:     context.options.page,
					limit:    context.options.limit,
					sort:     context.options.sort,
					fields:   [
						'review',
						'customer',
						'body',
						'createdAt',
					].join(','),
				}
			});

		}

		function countComments() {

			return Thunder.request({
				method: 'GET',
				url: '/v1/products/reviews/comments/count',
				query: {
					customer: customer,
				}
			});

		}

	};

	implementation.init = function(context) {

		const commentMap = context.comments.reduce((o, comment) => {
			return set(o, comment._id, comment);
		}, {});

		const $container = $(this);
		const $viewComment = $(this).find([
			'.thunder--customer-review-comment-body',
			'.thunder--view-comment',
		].join(','));
		const $pagination = $(this).find('.thunder--customer-review-comment-list-pagination');

		$viewComment.on('click', function(event) {

			event.preventDefault();

			const commentId = $(this).parents('[data-comment]').data('comment');
			const comment = commentMap[commentId];

			return Thunder.execute(
				context.options.onViewComment,
				$container,
				context,
				comment.review._id,
				comment._id
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