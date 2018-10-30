module.exports = Thunder => {

	const implementation = {
		name: 'subscription-list'
	};

	implementation.options = () => ({
		page:               1,    // Which page of subscriptions?
		limit:              10,   // How many subscriptions at once?
		usePagination:      true, // Use pagination?
		onViewSubscription: function($container, context, subscriptionId) {

			return Thunder.render($container, 'subscription-detail', {
				subscription: subscriptionId,
				back:         {
					$container: $container,
					component:  implementation.name,
					options:    context.options
				}
			});

		}
	});

	implementation.pre = function(context, callback) {

		const errors = {
			default: context.m('subscriptionListFailed')
		};

		return $.when(
			Thunder.request({
				method: 'GET',
				url:    '/v1/me/subscriptions',
				query:  {
					page:   context.options.page,
					limit:  context.options.limit,
					sort:   '-createdAt',
					fields: [
						'status',
						'plan',
						'schedules',
						'items.product',
						'cancellation',
						'endsAt',
						'createdAt',
					].join(',')
				}
			}),
			context.options.usePagination ? Thunder.request({
				method: 'GET',
				url:    '/v1/me/subscriptions/count',
				query:  {
					raw: true
				}
			}) : null
		).then((subscriptions, count) => {

			context.subscriptions = (subscriptions[0] || []).map(s => {

				s.maxScheduledAmount = s.schedules.reduce((max, s) => {
					return max > s.amount.raw ? max : s.amount;
				}, 0);

				s.duration = [
					s.schedules[0].time === 'now' ?
						s.createdAt :
						s.schedules[0].time,
					s.endsAt
				];

				return s;
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
		const $subscription = $(this).find('[data-subscription]');
		const $pagination = $(this).find('.thunder--subscription-list-pagination');

		$subscription.on('click', [
			'.thunder--subscription-id',
			'.thunder--subscription-thumbnail',
			'.thunder--subscription-first-item',
			'.thunder--subscription-rest-items',
		].join(','), event => Thunder.execute(
			context.options.onViewSubscription,
			$container,
			context,
			$(event.delegateTarget).data('subscription')
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