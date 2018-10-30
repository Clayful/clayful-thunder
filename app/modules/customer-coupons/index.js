module.exports = Thunder => {

	const implementation = {
		name: 'customer-coupons'
	};

	implementation.options = () => ({
		page:          1,
		limit:         24,
		usePagination: true,

		onDelete: function($container, context) {

			return Thunder.notify('success', context.m('deleteSuccess'));
		}
	});

	implementation.pre = function(context, callback) {

		context.couponListId = (Math.random() + '').slice(2);

		context.categories = coupon => (
			coupon.category.products ||
			coupon.category.brands ||
			coupon.category.collections
		).map(m => m.name).join(', ');

		const errors = {
			default: context.m('couponListFailed')
		};

		$.when(
			Thunder.request({
				method: 'GET',
				url:    '/v1/me/coupons',
				query:  {
					page:  context.options.page,
					limit: context.options.limit,
				}
			}),
			context.options.usePagination ? Thunder.request({
				method: 'GET',
				url:    '/v1/me/coupons/count',
				query:  { raw: true }
			}) : null
		).then((coupons, count) => {

			context.coupons = coupons[0];
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
		const $pagination = $(this).find('.thunder--customer-coupon-list-pagination');
		const $deleteCoupon = $(this).find('.thunder--delete-coupon');

		$deleteCoupon.on('click', deleteCoupon);

		if (context.options.usePagination) {

			Thunder.plugins.pagination({
				container: $pagination,
				currentPage: context.options.page,
				totalResult: context.count,
				resultPerPage: context.options.limit,
				onPageChange: ({ page }) => Thunder.render(
					$container,
					'customer-coupons',
					$.extend(context.options, { page })
				)
			});
		}

		function deleteCoupon() {

			const spinner = Thunder.util.makeAsyncButton($(this), { bind: false });

			spinner.run();

			const couponId = $(this).data('coupon');
			const $coupon = $container.find(`[data-coupon="${couponId}"]`);

			const errors = {
				default: context.m('couponDeleteFailed')
			};

			Thunder.request({
				method: 'DELETE',
				url:    `/v1/me/coupons/${couponId}`
			}).then(() => {

				spinner.done();
				$coupon.remove();
				$container.find('[data-mh]').matchHeight();

				return Thunder.execute(
					context.options.onDelete,
					$container,
					context
				);

			}, err => Thunder.util.requestErrorHandler(
				err.responseJSON,
				errors,
				err => spinner.done()
			));

		}

	};

	return implementation;

};