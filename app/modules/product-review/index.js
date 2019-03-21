const get = require('lodash.get');
const set = require('lodash.set');

module.exports = Thunder => {

	const reviewQuery = showProduct => ({
		fields: [
			'customer',
			'title',
			'body',
			'images',
			'rating',
			'helped',
			'flagged',
			'totalComment',
			'createdAt',
		].concat(showProduct ? 'product' : []).join(','),
		embed: '+product.thumbnail'
	});

	// Implementation
	const implementation = {
		name: 'product-review'
	};

	implementation.options = () => ({
		review:            null,                                 // Review ID or review object
		useCustomerAvatar: Thunder.options.customerAvatar,       // Use customer avatar
		useBodyExcerpt:    140,                                  // Body excerpt length || false
		useRating:         Thunder.options.productReviewRating,  // Use rating?
		useHelpVote:       true,                                 // Use helpful votes?
		useFlag:           true,                                 // Use flag?
		useComments:       Thunder.options.productReviewComment, // Use review comments?
		confirmOnDelete:   Thunder.options.confirmation.reviewDelete, // Whether to confirm before deleting a review
		showProduct:       false,                                // Show product detail?
		// Load & Show comments from the beginning?
		// (If it's an object, it will be passed as an option to `product-review-comments` component)
		showComments:      false,
	});

	implementation.pre = function(context, callback) {

		const review = context.options.review;

		if (typeof review === 'object') {

			return callback(null, setReview(review));
		}

		const errors = {
			default: context.m('reviewReadFailed')
		};

		return Thunder.request({
			method: 'GET',
			url:    `/v1/products/reviews/published/${review}`,
			query:  reviewQuery(context.options.showProduct)
		}).then(review => {

			return callback(null, setReview(review));

		}, err => Thunder.util.requestErrorHandler(
			err.responseJSON,
			errors,
			callback
		));

		function setReview(review) {
			return set(context, 'review', buildReview(review, context.options.useBodyExcerpt));
		}

	};

	implementation.init = function(context) {

		const $container = $(this);
		const $review = $container.find('.thunder--product-review');
		const $imageForm = $container.find('.thunder--edit-review-image-form');
		const $reviewImages = $container.find('.thunder--review-images');

		$container.on('click', '.thunder--helped-vote', helpVote);
		$container.on('click', '.thunder--flag', flag);
		$container.on('click', '.thunder--edit-product-review', editReview);
		$container.on('click', '.thunder--delete-product-review', deleteReview);
		$container.on('click', '.thunder--delete-review-image', function() {

			const $imageList = $(this).parents('.thunder--review-images');
			const imageId = $(this).parents('[data-image]').data('image');

			return removeImage($imageList, context.review, imageId);

		});

		$container.on('click', '.thunder--read-more', function() {

			const $reviewBody = $(this).parents('.thunder--product-review-body');

			$reviewBody.html(context.review.body);

		});

		$container.on('click', '.thunder--show-product-review-comment', showComments);

		Thunder.util.imageUploader(
			$imageForm,
			image => addImage($reviewImages, context.review, image),
			() => Thunder.notify('error', context.m('imageUploadFailed'))
		);

		if (context.options.useComments &&
			context.options.showComments) {
			// If `showComments` option is set to `true`,
			// render comments when the component initiates.
			showComments();
		}

		function validateReview(review) {

			if (!review.title) {
				return 'titleRequired';
			}

			return null;
		}

		function addImage($imageList, review, image) {

			// Update review
			review.images.push(image);

			// Update DOM
			$imageList.append(`
				<div class="thunder--review-image" data-image="${image._id}">
					<img src="${Thunder.util.imageURL(image, 120, 120)}">
					<span class="thunder--delete-review-image">${context.m('deleteImage')}</span>
				</div>
			`.trim());
		}

		function removeImage($imageList, review, imageId) {

			const image = review.images.find(image => image && (image._id === imageId));

			if (!image) return;

			// Update review
			review.images.splice(review.images.indexOf(image), 1);

			// Update DOM
			$imageList.find(`[data-image="${imageId}"]`).remove();

			// Remove from the storage (Fire & Forget)
			return Thunder.request({
				method: 'DELETE',
				url:    `/v1/me/images/${imageId}`
			});
		}

		function helpVote(event) {

			event.preventDefault();

			const review = context.review;
			const upDown = $(this).data('type');

			const errors = {
				unauthorized:      { type: 'info', message: context.m('loginRequired') },
				'duplicated-vote': context.m('duplicatedVote'),
				default:           context.m('helpVoteFailed')
			};

			return Thunder.request({
				method: 'POST',
				url:    `/v1/me/products/reviews/${review._id}/helped/${upDown}`,
			}).then(() => {
				return Thunder.notify('success', context.m('helpVoteSuccess'));
			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors
			));

		}

		function flag(event) {

			event.preventDefault();

			const review = context.review;

			const errors = {
				unauthorized:      { type: 'info', message: context.m('loginRequired') },
				'duplicated-flag': context.m('duplicatedFlag'),
				default:           context.m('flagFailed')
			};

			return Thunder.request({
				method: 'POST',
				url:    `/v1/me/products/reviews/${review._id}/flags`,
			}).then(() => {
				return Thunder.notify('success', context.m('flagSuccess'));
			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors
			));

		}

		function editReview(event) {

			event.preventDefault();

			const isEditing = $review.data('editing') || false;

			if (isEditing) {
				endReviewEditing();
				$review.removeClass('editing');
				$(this).text(context.m('editReview'));
			} else {
				startReviewEditing();
				$review.addClass('editing');
				$(this).text(context.m('saveReview'));
			}

			$review.data('editing', !isEditing);

		}

		function startReviewEditing() {

			const review = context.review;

			const $rating = $container.find('.thunder--review-stars');
			const $title = $container.find('.thunder--product-review-title');
			const $body = $container.find('.thunder--product-review-body');

			const $newRating =
				$(Thunder.ui('review-star-rating')($rating.data('rating')))
					.addClass($rating.attr('class'));
			const $newTitle = $(`<input class="${$title.attr('class')}" type="text" value="${review.title}" required>`);
			const $newBody = $(`<textarea class="${$body.attr('class')}">${review.body}</textarea>`);

			$rating.replaceWith($newRating);
			$title.replaceWith($newTitle);
			$body.replaceWith($newBody);

		}

		function endReviewEditing() {

			const review = context.review;

			const data = {
				rating: $container.find('.thunder--review-stars').val(),
				title:  $container.find('.thunder--product-review-title').val(),
				body:   $container.find('.thunder--product-review-body').val(),
				images: $container.find('.thunder--review-images [data-image]').map(function() {
					return $(this).data('image');
				}).get(),
			};

			const errorCode = validateReview(data);

			if (errorCode) {
				return Thunder.notify('error', context.m(errorCode));
			}

			return updateReview(data)
				.then(review => fetchReview(review))
				.then(review => done(review));

			function done(review) {

				context.review = review;

				Thunder.render($container, implementation.name, context);

				return Thunder.notify('success', context.m('reviewSaveSuccess'));

			}

			function updateReview(data) {

				const errors = {
					default: context.m('reviewSaveFailed')
				};

				return Thunder.request({
					method: 'PUT',
					url:    `/v1/me/products/reviews/${review._id}`,
					data:   data
				}).then(null, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors
				));

			}

			function fetchReview(review) {

				const errors = {
					default: context.m('reviewReadFailed')
				};

				return Thunder.request({
					method: 'GET',
					url:    `/v1/products/reviews/published/${review._id}`,
					query:  reviewQuery(context.options.showProduct)
				}).then(null, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors
				));

			}

		}

		function deleteReview(event) {

			event.preventDefault();

			const removeReview = () => {

				const review = context.review;

				deleteReviewImages(review);

				const errors = {
					default: context.m('deleteFailed')
				};

				return Thunder.request({
					method: 'DELETE',
					url:    `/v1/me/products/reviews/${review._id}`,
				}).then(() => {

					// Hide the review
					$container.addClass('hidden').hide();

					// Hide comments of the review
					$container.next('.thunder--review-comments-container').addClass('hidden').hide();

					return Thunder.notify('success', context.m('deleteSuccess'));

				}, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors
				));

			};

			if (!context.options.confirmOnDelete) {
				return removeReview();
			}

			return Thunder.plugins.confirmation(
				context.m('deleteConfirm'),
				() => removeReview()
			);

		}

		function deleteReviewImages(review) {

			const errors = {
				default: context.m('imageDeleteFailed')
			};

			return $.when(
				...review.images.map(image => Thunder.request({
					method: 'DELETE',
					url:    `/v1/me/images/${image._id || image}`
				}))
			).then(null, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors
			));

		}

		function showComments() {

			if (context.commentsLoaded) {
				return;
			}

			context.commentsLoaded = true;

			const review = context.review;

			const $commentsContainer = $(`<div class="thunder--review-comments-container" data-review="${review._id}"></div>`);

			$commentsContainer.insertAfter($container);

			return Thunder.render(
				$commentsContainer,
				'product-review-comments',
				$.extend(
					// Use `showComments` as an option when it's an object.
					typeof context.options.showComments === 'object' ?
						context.options.showComments :
						{},
					{
						review: review._id,
						hasNoComments: context.review.totalComment.raw === 0,
					}
				)
			);

		}

	};

	return implementation;

	function buildReview(review, useBodyExcerpt) {

		const customer = get(Thunder.authenticated('customer'), 'sub', 'unauthenticated');

		review.editable = get(review, 'customer._id') === customer;
		review.excerpt = Thunder.util.excerpt(review.body, useBodyExcerpt) || '';
		review.body = review.body || '';

		return review;

	}

};