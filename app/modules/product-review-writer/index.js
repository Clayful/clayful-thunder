module.exports = Thunder => {

	const reviewFields = [
		'customer',
		'title',
		'body',
		'images',
		'rating',
		'helped',
		'flagged',
		'totalComment',
		'createdAt',
	];

	// Implementation
	const implementation = {
		name: 'product-review-writer'
	};

	implementation.options = () => ({

		product:   null,                                // Product ID to write a review
		useRating: Thunder.options.productReviewRating, // Use rating?

		onReviewPost: function($container, context, review) {},
		onReviewCancel: function($container, context) {}

	});

	implementation.pre = function(context, callback) {

		return callback(null, context);

	};

	implementation.init = function(context) {

		const review = { images: [] };

		const $container = $(this);
		const $writeReviewForm = $(this).find('.thunder--write-review-form');
		const $writeReviewImageForm = $(this).find('.thunder--review-image-form');
		const $writeReviewImages = $writeReviewImageForm.find('.thunder--review-images');
		const $postReview = $(this).find('.thunder--post-product-review');
		const $cancelReview = $(this).find('.thunder--cancel-product-review');

		$cancelReview.on('click', cancelReviewWriting);

		$container.on('click', '.thunder--delete-review-image', function() {

			const imageId = $(this).parents('[data-image]').data('image');

			return removeImage(imageId);
		});

		Thunder.util.makeRecaptcha({
			componentName: implementation.name,
			button:        $postReview,
			validate:      validateReview,
			callback:      postReview,
		});

		Thunder.util.imageUploader(
			$writeReviewImageForm,
			image => addImage(image),
			() => Thunder.notify('error', context.m('imageUploadFailed'))
		);

		function cancelReviewWriting(event) {

			if (event) event.preventDefault();

			// Possibly a bug from Babel?
			// `review.images` actually contains multiple id,
			// but `removeImage()` only gets called once in `.forEach`
			review.images.forEach(imageId => {
				setTimeout(() => removeImage(imageId), 0);
			});

			resetForm();

			return Thunder.execute(
				context.options.onReviewCancel,
				$container,
				context
			);

		}

		function resetForm() {

			review.images.forEach(imageId => removeImage(imageId, true));

			$writeReviewForm.find('select').val(5);
			$writeReviewForm.find('input[type="text"],textarea').each(function() {
				$(this).val(null);
			});
			$writeReviewImageForm.find('input[type="file"]').val(null);

		}

		function getReview() {

			return $.extend(
				Thunder.util.formToJSON($writeReviewForm.serializeArray()),
				review
			);

		}

		function addImage(image) {

			// Update review
			review.images.push(image._id);

			// Update DOM
			$writeReviewImages.append(`
				<div class="thunder--review-image" data-image="${image._id}">
					<img src="${Thunder.util.imageURL(image, 120, 120)}">
					<span class="thunder--delete-review-image">${context.m('deleteImage')}</span>
				</div>
			`.trim());
		}

		function removeImage(imageId, doNotDelete = false) {

			// Update review
			review.images.splice(review.images.indexOf(imageId), 1);

			// Update DOM
			$writeReviewImages.find(`[data-image="${imageId}"]`).remove();

			if (doNotDelete) return;

			// Remove from the storage (Fire & Forget)
			return Thunder.request({
				method: 'DELETE',
				url:    `/v1/me/images/${imageId}`
			});
		}

		function validateReview() {

			const review = getReview();

			if (!review.title) {
				Thunder.notify('error', context.m('titleRequired'));
				return false;
			}

			return true;
		}

		function postReview(token, resetRecaptcha) {

			const resetState = () => resetRecaptcha && resetRecaptcha();

			return createReview()
					.then(review => fetchReview(review))
					.then(review => done(review));

			function done(review) {

				resetForm();

				Thunder.notify('success', context.m('reviewPostSuccess'));

				return Thunder.execute(
					context.options.onReviewPost,
					$container,
					context,
					review
				);

			}

			function createReview() {

				const errors = {
					'not-purchased-product': context.m('notPurchasedProduct'),
					default:                 context.m('reviewPostFailed')
				};

				return Thunder.request({
					method:    'POST',
					url:       '/v1/me/products/reviews',
					data:      getReview(),
					recaptcha: token,
				}).then(null, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors,
					resetState
				));

			}

			function fetchReview(review) {

				const errors = {
					default: context.m('reviewReadFailed')
				};

				return Thunder.request({
					method: 'GET',
					url:    `/v1/products/reviews/published/${review._id}`,
					query:  { fields: reviewFields.join(',') }
				}).then(null, err => Thunder.util.requestErrorHandler(
					err.responseJSON,
					errors,
					resetState
				));

			}

		}

	};

	return implementation;

};