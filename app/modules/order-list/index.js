module.exports = Thunder => {

	const implementation = {
		name: 'order-list'
	};

	implementation.options = () => ({
		page:          1,    // Which page of orders?
		limit:         10,   // How many orders at once?
		usePagination: true, // Use pagination?
		onViewOrder:   function($container, context, orderId) {

			return Thunder.render($container, 'order-detail', {
				order: orderId,
				back:  {
					$container: $container,
					component:  implementation.name,
					options:    context.options
				}
			});

		}
	});

	implementation.pre = function(context, callback) {

		const errors = {
			default: context.m('orderListFailed')
		};

		return $.when(
			Thunder.request({
				method: 'GET',
				url:    '/v1/me/orders',
				query:  {
					page:   context.options.page,
					limit:  context.options.limit,
					sort:   '-createdAt',
					fields: [
						'subscription',
						'status',
						'items.type',
						'items.product',
						'items.bundleItems.type',
						'fulfillments.status',
						'total.price.withTax',
						'cancellation',
						'receivedAt',
						'createdAt',
					].join(',')
				}
			}),
			context.options.usePagination ? Thunder.request({
				method: 'GET',
				url:    '/v1/me/orders/count',
				query:  {
					raw: true
				}
			}) : null
		).then((orders, count) => {

			context.orders = (orders[0] || []).map(order => {
				order.shippingStatus = Thunder.util.orderShippingStatus(order);
				return order;
			});

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
		const $order = $(this).find('[data-order]');
		const $pagination = $(this).find('.thunder--order-list-pagination');

		$order.on('click', [
			'.thunder--order-id',
			'.thunder--order-thumbnail',
			'.thunder--order-first-item',
			'.thunder--order-rest-items',
		].join(','), event => Thunder.execute(
			context.options.onViewOrder,
			$container,
			context,
			$(event.delegateTarget).data('order')
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