const get = require('lodash.get');
const set = require('lodash.set');

module.exports = Thunder => {

	const commentFields = [
		'customer',
		'collaborator',
		'body',
		'flagged',
		'createdAt',
	];

	// Implementation
	const implementation = {
		name: 'product-review-comments'
	};

	implementation.options = () => ({
		review:          null,         // Review ID
		page:            1,            // Which page of comments?
		limit:           10,           // How many comments at once?
		sort:            'createdAt',  // Default sort value
		filter:          null,         // Extra query filter
		useBodyExcerpt:  140,          // Length of a body excerpt || false
		useFlag:         true,         // Use flag?
		usePagination:   true,         // Use Pagination?
		hasNoComments:   false,        // Has no comments? (when it's already known)

		onUnauthenticatedWriteComment: function($container, context) {
			return Thunder.notify('info', context.m('loginRequired'));
		}
	});

	implementation.pre = function(context, callback) {

		if (context.options.hasNoComments) {
			// If the review doesn't have any comments, do not call APIs.
			context.comments = [];
			context.count = { raw: 0, formatted: '0', converted: '0' };
			return callback(null, context);
		}

		const errors = {
			default: context.m('commentListFailed')
		};

		const defaultQuery = $.extend({
			review: context.options.review,
		}, Thunder.util.parseQueryString(context.options.filter));

		return $.when(
			fetchComments(),
			countComments()
		).then((comments, count) => callback(null, $.extend(context, {
			comments: (comments[0] || []).map(c => {
				return buildReviewComment(c, context.options.useBodyExcerpt);
			}),
			count:    count ? count[0].count : null,
		})), err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));

		function fetchComments() {

			const query = $.extend({}, defaultQuery, {
				page:   context.options.page,
				limit:  context.options.limit,
				sort:   context.options.sort,
				fields: commentFields.join(',')
			});

			return Thunder.request({
				method: 'GET',
				url:    '/v1/products/reviews/comments',
				query:  query
			});

		}

		function countComments() {

			const query = $.extend({}, defaultQuery);

			delete query.ids;

			return Thunder.request({
				method: 'GET',
				url:    '/v1/products/reviews/comments/count',
				query:  query
			});

		}

	};

	implementation.init = function(context) {

		let commentMap = {};

		const $container = $(this);
		const $writeComment = $(this).find('.thunder--write-comment');
		const $commentWriterContainer = $(this).find('.thunder--comment-writer-container');
		const $commentBody = $commentWriterContainer.find('textarea');
		const $postComment = $commentWriterContainer.find('.thunder--post-comment');
		const $cancelComment = $commentWriterContainer.find('.thunder--cancel-comment');
		const $commentList = $(this).find('.thunder--review-comment-list');
		const $pagination = $(this).find('.thunder--review-comment-list-pagination');

		updateCommentMap();

		$writeComment.on('click', startCommentWriting);
		$cancelComment.on('click', cancelComment);

		$container.on('click', '.thunder--read-more', readMore);
		$container.on('click', '.thunder--edit-review-comment', editComment);
		$container.on('click', '.thunder--delete-review-comment', deleteComment);
		$container.on('click', '.thunder--flag', flagComment);


		Thunder.util.makeRecaptcha({
			componentName: implementation.name,
			button:        $postComment,
			validate:      validateComment,
			callback:      postComment,
		});

		if (context.options.usePagination) {

			Thunder.plugins.pagination({
				type:          'simple',
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

		function updateCommentMap() {

			commentMap = context.comments.reduce((o, comment) => {
				return set(o, comment._id, comment);
			}, {});

		}

		function startCommentWriting(event) {

			event.preventDefault();

			if (Thunder.authenticated()) {
				return showCommentWriter();
			}

			return Thunder.execute(
				context.options.onUnauthenticatedWriteComment,
				$container,
				context
			);

		}

		function getComment() {
			return {
				review: context.options.review,
				body:   $commentBody.val(),
			};
		}

		function validateComment(comment) {

			comment = comment || getComment();

			if (!comment.body) {
				Thunder.notify('error', context.m('bodyRequired'));
				return false;
			}

			return true;
		}

		function postComment(token, resetRecaptcha) {

			const resetState = () => resetRecaptcha && resetRecaptcha();

			const data = getComment();

			return createComment(data)
					.then(comment => fetchComment(comment))
					.then(comment => done(comment));

			function done(comment) {

				comment = buildReviewComment(comment, context.options.useBodyExcerpt);

				context.comments.unshift(comment);

				updateCommentMap();

				const $template = $(Thunder.component(implementation.name).template($.extend({}, context, {
					comments: [comment]
				})));

				const $comment = $($template.find('.thunder--review-comment-list').html());

				$commentList.prepend($comment);

				cancelComment();

				resetState();

				return Thunder.notify('success', context.m('commentPostSuccess'));

			}

			function createComment(data) {

				const errors = {
					default: context.m('commentPostFailed')
				};

				return Thunder.request({
					method:    'POST',
					url:       '/v1/me/products/reviews/comments',
					data:      data,
					recaptcha: token,
				}).then(null, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors,
					resetState
				));

			}

			function fetchComment(comment) {

				const errors = {
					default: context.m('commentReadFailed')
				};

				return Thunder.request({
					method: 'GET',
					url:    `/v1/products/reviews/comments/${comment._id}`,
					query:  {
						fields: commentFields.join(',')
					}
				}).then(null, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors,
					resetState
				));

			}

		}

		function cancelComment(event) {

			if (event) event.preventDefault();

			$commentBody.val(null);
			hideCommentWriter();
		}

		function showCommentWriter() {
			$writeComment.hide();
			$commentWriterContainer.show();
		}

		function hideCommentWriter() {
			$writeComment.show();
			$commentWriterContainer.hide();
		}

		function readMore(event) {

			event.preventDefault();

			const $comment = $(this).parents('[data-review-comment]');
			const commentId = $comment.data('reviewComment');
			const body = commentMap[commentId].body;

			$comment.find('.thunder--review-comment-body').html(body);

		}

		function editComment(event) {

			event.preventDefault();

			const isEditing = $(this).data('editing');
			const $comment = $(this).parents('[data-review-comment]');
			const commentId = $comment.data('reviewComment');

			if (isEditing) {

				const $input = $comment.find('textarea.thunder--review-comment-body');

				const data = { body: $input.val() || null };

				if (!validateComment(data)) {
					return;
				}

				const errors = {
					default: context.m('saveFailed'),
				};

				return Thunder.request({
					method: 'PUT',
					url:    `/v1/me/products/reviews/comments/${commentId}`,
					data:   data,
				}).then(comment => {

					$(this).text(context.m('editComment'));
					$(this).data('editing', false);

					const $body = $(`<div class="${$input.attr('class')}"></div>`);

					$body.html(comment.body);

					$input.replaceWith($body);

					return Thunder.notify('success', context.m('saveSuccess'));

				}, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors
				));

			} else {

				const comment = commentMap[commentId];

				const $body = $comment.find('.thunder--review-comment-body');

				const $input = $(`<textarea class="${$body.attr('class')}">${comment.body || ''}</textarea>`);

				$body.replaceWith($input);

				$(this).text(context.m('saveComment'));
				$(this).data('editing', true);
			}

		}

		function deleteComment(event) {

			if (event) event.preventDefault();

			const $comment = $(this).parents('[data-review-comment]');
			const commentId = $comment.data('reviewComment');

			const errors = {
				default: context.m('deleteFailed'),
			};

			return Thunder.request({
				method: 'DELETE',
				url:    `/v1/me/products/reviews/comments/${commentId}`,
			}).then(() => {
				$comment.addClass('hidden').hide();
				return Thunder.notify('success', context.m('deleteSuccess'));
			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors
			));

		}

		function flagComment(event) {

			if (event) event.preventDefault();

			const commentId = $(this).parents('[data-review-comment]').data('reviewComment');

			const errors = {
				default:           context.m('flagFailed'),
				'duplicated-flag': context.m('duplicatedFlag'),
			};

			return Thunder.request({
				method: 'POST',
				url:    `/v1/me/products/reviews/comments/${commentId}/flags`,
			}).then(() => {
				return Thunder.notify('success', context.m('flagSuccess'));
			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors
			));

		}

	};

	return implementation;

	function buildReviewComment(comment, useBodyExcerpt) {

		const customer = get(Thunder.authenticated('customer'), 'sub', 'unauthenticated');

		comment.editable = get(comment, 'customer._id') === customer;
		comment.excerpt = Thunder.util.excerpt(comment.body, useBodyExcerpt) || '';
		comment.body = comment.body || '';

		return comment;

	}

};